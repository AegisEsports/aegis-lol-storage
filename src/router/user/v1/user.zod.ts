import z from 'zod';

import {
  discordAccountRowSchema,
  riotAccountRowSchema,
  userRowSchema,
} from '@/database/schema.js';

// POST - /
export const postUserBody = z.strictObject({
  user: userRowSchema,
  riotAccounts: z.array(riotAccountRowSchema).default([]).optional(),
  discordAccounts: z.array(discordAccountRowSchema).default([]).optional(),
});
export type CreateUserBody = z.infer<typeof postUserBody>;

// POST - /riot-account
export const postRiotAccountBody = z.strictObject({
  riotAccount: riotAccountRowSchema,
});
export type CreateRiotAccountBody = z.infer<typeof postRiotAccountBody>;

// POST - /discord-account
export const postDiscordAccountBody = z.strictObject({
  discordAccount: discordAccountRowSchema,
});
export type CreateDiscordAccountBody = z.infer<typeof postDiscordAccountBody>;

// GET - /{userId}
export const getUserParams = z.strictObject({
  userId: z.uuid(),
});

// GET - /riot-account/{riotAccountId}
export const getRiotAccountParams = z.strictObject({
  riotAccountId: z.uuid(),
});

// GET - /riot-account/by-puuid/{riotPuuid}
export const getRiotAccountByPuuidParams = z.strictObject({
  riotPuuid: z.string(),
});

// PUT - /{userId}
export const putUserParams = getUserParams.clone();
export const putUserBody = z.strictObject({
  user: userRowSchema,
});
export type UpdateUserBody = z.infer<typeof putUserBody>;

// PUT - /riot-account/{riotAccountId}
export const putRiotAccountParams = getRiotAccountParams.clone();
export const putRiotAccountBody = z.strictObject({
  riotAccount: riotAccountRowSchema.omit({ riotPuuid: true }),
});
export type UpdateRiotAccountBody = z.infer<typeof putRiotAccountBody>;

// PUT - /discord-account/{discordAccountId}
export const putDiscordAccountParams = z.strictObject({
  discordAccountId: z.uuid(),
});
export const putDiscordAccountBody = z.strictObject({
  discordAccount: discordAccountRowSchema.omit({ snowflakeId: true }),
});
export type UpdateDiscordAccountBody = z.infer<typeof putDiscordAccountBody>;

// PATCH - /riot-account/{riotAccountId}/{userId}
export const patchRiotAccountParams = z.strictObject({
  riotAccountId: z.uuid(),
  userId: z.uuid(),
});

// PATCH - /discord-account/{discordAccountId}/{userId}
export const patchDiscordAccountParams = z.strictObject({
  discordAccountId: z.uuid(),
  userId: z.uuid(),
});

// DELETE - /{userId}
export const deleteUserParams = getUserParams.clone();
