import {
  MatchV5TimelineDTOs,
  type MatchV5DTOs,
} from 'twisted/dist/models-dto/index.js';
import z from 'zod';

import { isStringJson, LEAGUE_SIDES } from '@/database/shared.js';

// POST - /
export const postGameBody = z.strictObject({
  leagueMatchId: z.uuid().nullable(),
  blueTeamId: z.uuid().nullable(),
  redTeamId: z.uuid().nullable(),
  rawMatchData: isStringJson<MatchV5DTOs.MatchDto>(),
  rawTimelineData: isStringJson<MatchV5TimelineDTOs.MatchTimelineDto>(),
});
export type CreateGameBody = z.infer<typeof postGameBody>;

// GET - /{gameId}
export const getGameParams = z.strictObject({
  gameId: z.uuid(),
});

// GET - /riot-data/{gameId}
export const getGameRiotDataParams = getGameParams.clone();

// PATCH - /{gameId}/{matchId}
export const patchGameMatchParams = z.strictObject({
  gameId: z.uuid(),
  matchId: z.uuid(),
});

// PATCH - /team-stats/{gameId}/{side}/{teamId}
export const patchGameTeamStatParams = z.strictObject({
  gameId: z.uuid(),
  side: z.enum(LEAGUE_SIDES.map((s) => s.toLowerCase())),
  teamId: z.uuid(),
});

// DELETE - /{gameId}
export const deleteGameParams = getGameParams.clone();
