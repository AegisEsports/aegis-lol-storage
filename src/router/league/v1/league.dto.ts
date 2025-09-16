import z from 'zod';

import {
  leagueBanRowSchema,
  leagueRowSchema,
  type LeagueBanRow,
  type LeagueRow,
  type SplitRow,
} from '@/database/schema.js';

// POST - /
export const postLeagueBody = z.strictObject({
  league: leagueRowSchema,
});
export type CreateLeagueBody = z.infer<typeof postLeagueBody>;

// POST - /league-ban
export const postLeagueBanBody = z.strictObject({
  leagueBan: leagueBanRowSchema,
});
export type CreateLeagueBanBody = z.infer<typeof postLeagueBanBody>;
export type LeagueBanDto = {
  leagueBan: LeagueBanRow;
};

// GET - /{leagueId}
export const getLeagueParams = z.strictObject({
  leagueId: z.uuid(),
});
export type UsersBannedInLeagueDto = LeagueBanRow & {
  username: string;
};
export type LeagueDto = {
  league: LeagueRow;
  splits: SplitRow[];
  usersBanned: UsersBannedInLeagueDto[];
};

// PUT - /{leagueId}
export const putLeagueParams = getLeagueParams.clone();
export const putLeagueBody = z.strictObject({
  league: leagueRowSchema,
});
export type UpdateLeagueBody = z.infer<typeof putLeagueBody>;

// PUT - /league-ban/{leagueBanId}
export const putLeagueBanParams = z.strictObject({
  leagueBanId: z.uuid(),
});
export const putLeagueBanBody = z.strictObject({
  leagueBan: leagueBanRowSchema,
});
export type UpdateLeagueBanBody = z.infer<typeof putLeagueBanBody>;

// DELETE - /{leagueId}
export const deleteLeagueParams = getLeagueParams.clone();

// DELETE - /{leagueBanId}
export const deleteLeagueBanParams = putLeagueBanParams.clone();
