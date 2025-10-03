import z from 'zod';

// POST - /
export const postGameBody = z.strictObject({
  leagueMatchId: z.uuid().nullable(),
  blueTeamId: z.uuid(),
  redTeamId: z.uuid(),
  riotMatchId: z.string(),
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

// DELETE - /{gameId}
export const deleteGameParams = getGameParams.clone();
