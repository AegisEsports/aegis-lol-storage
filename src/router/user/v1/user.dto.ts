import {
  type DiscordAccountRow,
  type LeagueBanRow,
  type LeagueGameRow,
  type OrganizationRow,
  type RiotAccountRow,
  type TeamRow,
  type UserRow,
} from '@/database/schema.js';
import type { LeagueRole, LeagueSide } from '@/database/shared.js';

// UserDto
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
  win: boolean | null;
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

// UserTableDto
export type UserTableDto = {
  user: UserRow;
};

// RiotAccountDto
export type RiotAccountDto = {
  riotAccount: RiotAccountRow;
};

// DiscordAccountDto
export type DiscordAccountDto = {
  discordAccount: DiscordAccountRow;
};
