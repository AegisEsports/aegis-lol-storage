import type { LeagueMatchRow } from '@/database/schema.js';
import type { LeagueSide } from '@/database/shared.js';

// MatchDto
export type MatchGameStatsDto = {
  teamId: string | null;
  teamName: string | null;
  champBanIds: number[];
  champPickIds: number[];
  gold: number;
  kills: number;
  towers: number;
  dragons: number;
};
export type MatchGameDto = {
  leagueGameId: string;
  gameNumber: number;
  blueTeam: MatchGameStatsDto;
  redTeam: MatchGameStatsDto;
  sideWin: LeagueSide;
  duration: number;
};
export type LeagueMatchDto = LeagueMatchRow & {
  homeTeamName: string | null;
  awayTeamName: string | null;
};
export type MatchDto = {
  match: LeagueMatchDto;
  games: MatchGameDto[];
};

// TableMatchDto
export type MatchTableDto = {
  match: LeagueMatchRow;
};
