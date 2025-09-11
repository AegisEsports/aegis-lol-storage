import z from 'zod';

import {
  discordAccountRowSchema,
  riotAccountRowSchema,
  userRowSchema,
  type DiscordAccountRow,
  type LeagueBanRow,
  type LeagueGameRow,
  type OrganizationRow,
  type RiotAccountRow,
  type TeamRow,
  type UserRow,
} from '@/database/schema.js';
import type { LeagueRole, LeagueSide } from '@/database/shared.js';

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
export type DiscordAccountDto = {
  discordAccount: DiscordAccountRow;
};

// POST - /discord-account
export const postDiscordAccountBody = z.strictObject({
  discordAccount: discordAccountRowSchema,
});
export type CreateDiscordAccountBody = z.infer<typeof postDiscordAccountBody>;
export type RiotAccountDto = {
  riotAccount: RiotAccountRow;
};

// GET - /{userId}
export const getUserParams = z.strictObject({
  userId: z.uuid(),
});
export type TeamPlayedInDto = TeamRow & {
  startDate: string | null; // when they were added to the roster
  endDate: string | null; // when they were removed from the roster
  leagueId: string | null;
  leagueName: string | null;
  splitName: string | null;
};
export type GamesPlayedInDto = LeagueGameRow & {
  side: LeagueSide | null;
  role: LeagueRole | null;
  win: boolean;
  eSubbed: boolean;
};
export type UserDto = {
  user: UserRow;
  teams: TeamPlayedInDto[]; // sorted by startDate
  games: GamesPlayedInDto[];
  riotAccounts: RiotAccountRow[];
  discordAccounts: DiscordAccountRow[];
  organizationsOwn: OrganizationRow[];
  leagueBans: LeagueBanRow[];
};

// PUT - /{userId}
export const putUserParams = getUserParams.clone();
export const putUserBody = z.strictObject({
  user: userRowSchema,
});
export type UpdateUserBody = z.infer<typeof putUserBody>;

// PUT - /riot-account/{riotAccountId}
export const putRiotAccountParams = z.strictObject({
  riotAccountId: z.uuid(),
});
export const putRiotAccountBody = postRiotAccountBody.clone();
export type UpdateRiotAccountBody = z.infer<typeof putRiotAccountBody>;

// PUT - /discord-account/{discordAccountId}
export const putDiscordAccountParams = z.strictObject({
  discordAccountId: z.uuid(),
});
export const putDiscordAccountBody = postDiscordAccountBody.clone();
export type UpdateDiscordAccountBody = z.infer<
  // It's the same as POST but we'll make a different one as needed.
  typeof putDiscordAccountBody
>;

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
