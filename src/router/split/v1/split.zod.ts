import z from 'zod';

import { splitRowSchema } from '@/database/schema.js';

// POST - /
export const postSplitBody = z.strictObject({
  split: splitRowSchema,
});
export type CreateSplitBody = z.infer<typeof postSplitBody>;

// GET - /{splitId}
export const getSplitParams = z.strictObject({
  splitId: z.uuid(),
});

// GET - /players/{splitId}
export const getSplitPlayerStatsParams = getSplitParams.clone();

// GET - /teams/{splitId}
export const getSplitTeamStatsParams = getSplitParams.clone();

// GET - /games/{splitId}
export const getSplitGamesParams = getSplitParams.clone();

// GET - /champs/{splitId}
export const getSplitChampionStatsParams = getSplitParams.clone();

// PUT - /{splitId}
export const putSplitParams = getSplitParams.clone();
export const putSplitBody = postSplitBody.clone();
export type UpdateSplitBody = z.infer<typeof putSplitBody>;

// DELETE - /{splitId}
export const deleteSplitParams = getSplitParams.clone();
