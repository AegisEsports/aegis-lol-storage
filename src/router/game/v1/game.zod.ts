import z from 'zod';

import { LEAGUE_SIDES } from '@/database/shared.js';

// POST - /
export const postGameBody = z.strictObject({
  leagueMatchId: z.uuid().nullable(),
  blueTeamId: z.uuid(),
  redTeamId: z.uuid(),
  riotMatchId: z.string(),
  draftLink: z.url().nullable(),
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

// PATCH - /draft-link/{gameId}
export const patchGameDraftLinkParams = getGameParams.clone();
// Putting as a body param since URLs can be long and messy
export const patchGameDraftLinkBody = z.strictObject({
  draftLink: z.url().or(z.literal('')).nullable(),
});
export type PatchGameDraftLinkBody = z.infer<typeof patchGameDraftLinkBody>;

// PATCH - /team/{gameId}/{side}/{teamId}
export const patchGameTeamParams = z.strictObject({
  gameId: z.uuid(),
  side: z.enum(LEAGUE_SIDES.map((s) => s.toLowerCase())),
  teamId: z.uuid(),
});

// DELETE - /{gameId}
export const deleteGameParams = getGameParams.clone();
