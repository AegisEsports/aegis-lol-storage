import {
  type LeagueBanRow,
  type LeagueRow,
  type SplitRow,
} from '@/database/schema.js';

// LeagueDto
export type UsersBannedInLeagueDto = LeagueBanRow & {
  username: string;
};
export type LeagueDto = {
  league: LeagueRow;
  splits: SplitRow[];
  usersBanned: UsersBannedInLeagueDto[];
};

// LeagueTableDto
export type LeagueTableDto = {
  league: LeagueRow;
};

// LeagueBanDto
export type LeagueBanDto = {
  leagueBan: LeagueBanRow;
};
