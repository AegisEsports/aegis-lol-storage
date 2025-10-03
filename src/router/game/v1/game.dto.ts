import type {
  BannedChampFields,
  GameEventFields,
  GameSkillLevelUpFields,
  GameStoreActionFields,
  GameTeamGoldFields,
  LeagueGameRow,
  PlayerStatFields,
  PlayerStatRow,
  TeamStatFields,
  TeamStatRow,
} from '@/database/schema.js';

// GameDto
export type GameTeamStatRow = TeamStatRow & {
  teamName: string | null;
};
export type TeamStatDto = TeamStatFields & {
  teamName: string | null;
};
/** Mainly used for the list query. */
export type GamePlayerStatRow = PlayerStatRow & {
  username: string | null;
};
export type PlayerStatDto = PlayerStatFields & {
  username: string | null;
};
export type GameDto = {
  game: LeagueGameRow;
  bannedChamps: BannedChampFields[];
  teamStats: TeamStatDto[];
  playerStats: PlayerStatDto[];
  gameEvents: GameEventFields[];
  teamGoldTimeline: GameTeamGoldFields[];
  storeActions: GameStoreActionFields[];
  skillLevelUps: GameSkillLevelUpFields[];
};

// TableGameDto
export type GameTableDto = {
  game: LeagueGameRow;
};
