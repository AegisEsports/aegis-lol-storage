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

// PUT - /{splitId}
export const putSplitParams = getSplitParams.clone();
export const putSplitBody = postSplitBody.clone();
export type UpdateSplitBody = z.infer<typeof putSplitBody>;

// DELETE - /{splitId}
export const deleteSplitParams = getSplitParams.clone();
