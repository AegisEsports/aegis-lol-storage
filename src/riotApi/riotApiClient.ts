import { LolApi } from 'twisted';
import type { RegionGroups } from 'twisted/dist/constants/regions.js';
import type {
  MatchV5DTOs,
  MatchV5TimelineDTOs,
} from 'twisted/dist/models-dto/index.js';

import { RIOT_API_KEY } from '@/config/env.js';
import ControllerError from '@/util/errors/controllerError.js';

export type RiotApiClientOptions = {
  apiKey?: string; // default: process.env.RIOT_API_KEY
  retries?: number; // default: 2
  cacheTtlMs?: number; // default: 60_000 (1 minute)
};

/**
 * Light wrapper around Twisted.
 * - Normalizes errors
 * - Adds simple in-memory caching
 * - Adds simple linear retry for transient errors (>=500 or network)
 */
export class RiotApiClient {
  private lol: LolApi;
  private readonly retries: number;
  private readonly cacheTtlMs: number;

  /**
   * Naive in-memory cache for hot paths. Not suitable for distributed/multi-instance use.
   * Refine this later on if needed.
   */
  private readonly cache = new Map<
    string,
    { expires: number; value: unknown }
  >();

  constructor(opts: RiotApiClientOptions = {}) {
    const apiKey = opts.apiKey ?? RIOT_API_KEY;
    if (!apiKey) {
      throw new ControllerError(
        500,
        'RiotApiError',
        'RiotApiClient: RIOT_API_KEY is not set in environment variables',
      );
    }

    this.lol = new LolApi({ key: apiKey });
    this.retries = opts.retries ?? 2;
    this.cacheTtlMs = opts.cacheTtlMs ?? 60_000;
  }

  /** GET /lol/match/v5/matches/{matchId} */
  async getMatch(
    matchId: string,
    region: RegionGroups,
  ): Promise<MatchV5DTOs.MatchDto> {
    const cacheKey = `match:${region}:${matchId}`;
    const cached = this.fromCache<MatchV5DTOs.MatchDto>(cacheKey);
    if (cached) return cached;

    const result = await this.withRetries(() =>
      this.lol.MatchV5.get(matchId, region),
    );
    // Twisted responses are shaped { response, status, rateLimits, ... }
    const data = result.response as MatchV5DTOs.MatchDto;

    this.toCache(cacheKey, data);
    return data;
  }

  /** GET /lol/match/v5/matches/{matchId}/timeline */
  async getMatchTimeline(
    matchId: string,
    region: RegionGroups,
  ): Promise<MatchV5TimelineDTOs.MatchTimelineDto> {
    const cacheKey = `timeline:${region}:${matchId}`;
    const cached =
      this.fromCache<MatchV5TimelineDTOs.MatchTimelineDto>(cacheKey);
    if (cached) return cached;

    const result = await this.withRetries(() =>
      this.lol.MatchV5.timeline(matchId, region),
    );
    const data = result.response as MatchV5TimelineDTOs.MatchTimelineDto;

    this.toCache(cacheKey, data);
    return data;
  }

  // ===== internals =====
  private fromCache<T>(key: string): T | null {
    const hit = this.cache.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expires) {
      this.cache.delete(key);
      return null;
    }
    return hit.value as T;
  }

  private toCache(key: string, value: unknown): void {
    this.cache.set(key, { value, expires: Date.now() + this.cacheTtlMs });
  }

  private async withRetries<T>(fn: () => Promise<T>): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      try {
        return await fn();
      } catch (err: any) {
        lastErr = err;
        const status = err?.status ?? err?.response?.status;
        const retriable = !status || status >= 500 || status === 429; // network, 5xx, or rate-limited

        if (!retriable || attempt === this.retries) break;

        // basic backoff (linear)
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }

    // Normalize a helpful error
    const status =
      (lastErr as any)?.status ?? (lastErr as any)?.response?.status;
    const message =
      (lastErr as any)?.message ||
      (lastErr as any)?.response?.data?.status?.message ||
      'Riot API request failed';

    const e = new ControllerError(
      500,
      'RiotApiError',
      `Riot API error${status ? ` (${status})` : ''}: ${message}`,
    );
    (e as any).cause = lastErr;
    throw e;
  }
}
