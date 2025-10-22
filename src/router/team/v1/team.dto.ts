import {
  type DiscordAccountRow,
  type EmergencySubRequestRow,
  type LeagueGameRow,
  type LeagueMatchRow,
  type RiotAccountRow,
  type RosterRequestRow,
  type SplitRow,
  type TeamRosterRow,
  type TeamRow,
  type UserRow,
} from '@/database/schema.js';
import type { LeagueSide, RosterRole } from '@/database/shared.js';

// TeamDto
export type PlayerDto = {
  role: string;
  user: UserRow | null;
  riotAccounts: RiotAccountRow[];
  discordAccounts: DiscordAccountRow[];
};
export type TeamPlayerInGameDto = {
  userId: string | null;
  username: string | null;
  role: string | null;
  champId: number | null;
  champName: string | null;
  goldDiff10: number | null;
  goldDiff15: number | null;
};
export type TeamStatPlayedInDto = {
  totalKills: number | null;
  totalGold: number | null;
  totalTowers: number | null;
  totalDragons: number | null;
  opposingKills: number | null;
  opposingGold: number | null;
  opposingTowers: number | null;
  opposingDragons: number | null;
};
export type TeamGamePlayedInDto = LeagueGameRow & {
  side: LeagueSide | null;
  stats: TeamStatPlayedInDto;
  players: TeamPlayerInGameDto[];
};
export type TeamMatchPlayedInDto = LeagueMatchRow & {
  opposingTeamName: string | null;
  games: TeamGamePlayedInDto[];
};
export type ChampionPickStatDto = {
  champId: number;
  champName: string | null;
  picks: number;
  wins: number;
};
export type ChampionBanStatDto = {
  champId: number;
  bans: number;
};
export type TeamChampionStatsDto = {
  picks: ChampionPickStatDto[];
  bansBy: ChampionBanStatDto[];
  bansAgainst: ChampionBanStatDto[];
};
export type TeamDto = {
  team: TeamRow;
  split: SplitRow;
  roster: Record<RosterRole, PlayerDto>; // role -> DTO
  matches: TeamMatchPlayedInDto[];
  championStats: TeamChampionStatsDto;
  rosterRequests: RosterRequestRow[];
  emergencySubRequests: EmergencySubRequestRow[];
};

// TeamTableDto
export type TeamTableDto = {
  team: TeamRow;
};

// RosterRequestDto
export type RosterRequestDto = {
  rosterRequest: RosterRequestRow;
};

// EmergencySubRequestDto
export type EmergencySubRequestDto = {
  emergencySubRequest: EmergencySubRequestRow;
};

// TeamRosterDto
export type TeamRosterDto = {
  teamRoster: TeamRosterRow;
};
