import type {
  BannedChampRow,
  GameEventRow,
  GameSkillLevelUpRow,
  GameStoreActionRow,
  GameTeamGoldRow,
  LeagueGameRow,
  PlayerStatRow,
  TeamStatRow,
} from '@/database/schema.js';

// GameDto
export type GameDto = {
  game: LeagueGameRow;
  bannedChamps: BannedChampRow[];
  teamStats: TeamStatRow[];
  playerStats: PlayerStatRow[];
  gameEvents: GameEventRow[];
  teamGoldTimeline: GameTeamGoldRow[];
  storeActions: GameStoreActionRow[];
  skillLevelUps: GameSkillLevelUpRow[];
};

// TableGameDto
export type GameTableDto = {
  game: LeagueGameRow;
};

// TableTeamStatsDto
export type TeamStatTableDto = {
  teamStat: TeamStatRow;
};
