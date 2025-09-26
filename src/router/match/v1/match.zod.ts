import z from 'zod';

import { leagueMatchRowSchema } from '@/database/schema.js';
import { MATCH_SIDES } from '@/database/shared.js';

// POST - /
export const postMatchBody = z.strictObject({
  match: leagueMatchRowSchema,
});
export type CreateMatchBody = z.infer<typeof postMatchBody>;

// GET - /{matchId}
export const getMatchParams = z.strictObject({
  matchId: z.uuid(),
});

// PUT - /{matchId}
export const putMatchParams = getMatchParams.clone();
export const putMatchBody = z.strictObject({
  match: leagueMatchRowSchema,
});
export type UpdateMatchBody = z.infer<typeof putMatchBody>;

// PATCH - /{matchId}/{side}/{teamId}
export const patchMatchTeamParams = z.strictObject({
  matchId: z.uuid(),
  side: z.enum(MATCH_SIDES.map((s) => s.toLowerCase())),
  teamId: z.uuid(),
});

// DELETE - /{matchId}
export const deleteMatchParams = getMatchParams.clone();
