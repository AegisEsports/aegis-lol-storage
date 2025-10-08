import type {
  EmergencySubRequestRow,
  RosterRequestRow,
  SplitRow,
  TeamRow,
} from '@/database/schema.js';

// SplitDto
export type SidesStatsDto = {
  blueSides: number | null;
  redSides: number | null;
};
export type DragonStatsDto = {
  cloud: number | null;
  ocean: number | null;
  infernal: number | null;
  mountain: number | null;
  hextech: number | null;
  chemtech: number | null;
  elder: number | null;
};
type GameStatRecordBase = {
  leagueGameId: string;
  blueTeamName: string | null;
  redTeamName: string | null;
  duration: number | null;
};
export type GameStatRecordTotalKillsDto = GameStatRecordBase & {
  totalKills: number | null;
};
export type GameStatRecordTotalKillsAt15Dto = GameStatRecordBase & {
  killsAt15: number | null;
};
export type GameStatRecordCreepScorePerMinuteDto = GameStatRecordBase & {
  creepScorePerMinute: number | null;
};
export type GameStatRecordGoldPerMinuteDto = GameStatRecordBase & {
  goldPerMinute: number | null;
};
export type GameStatRecordDamagePerMinuteDto = GameStatRecordBase & {
  damageDealtPerMinute: number | null;
};
export type GameStatRecordVisionScorePerMinuteDto = GameStatRecordBase & {
  visionScorePerMinute: number | null;
};
type TeamStatRecordBase = {
  leagueGameId: string;
  teamName: string | null;
  opposingTeamName: string | null;
};
export type TeamStatRecordFirstTowerTimestampDto = TeamStatRecordBase & {
  firstTowerTimestamp: number | null;
};
export type TeamStatRecordFirstBloodTimestampDto = TeamStatRecordBase & {
  firstBloodTimestamp: number | null;
};
export type TeamStatRecordFirstInhibitorTimestampDto = TeamStatRecordBase & {
  firstInhibitorTimestamp: number | null;
};
export type TeamStatRecordKillsAt15Dto = TeamStatRecordBase & {
  killsAt15: number | null;
  killsDiff15: number | null;
};
export type TeamStatRecordGoldAt15Dto = TeamStatRecordBase & {
  goldAt15: number | null;
  goldDiff15: number | null;
};
export type TeamStatRecordDamageAt15Dto = TeamStatRecordBase & {
  damageAt15: number | null;
  damageDiff15: number | null;
};
export type TeamStatRecordWardsPlacedAt15Dto = TeamStatRecordBase & {
  wardsPlacedAt15: number | null;
  wardsPlacedDiff15: number | null;
};
export type TeamStatRecordWardsClearedAt15Dto = TeamStatRecordBase & {
  wardsClearedAt15: number | null;
  wardsClearedDiff15: number | null;
};
type PlayerStatRecordBase = {
  leagueGameId: string;
  username: string | null;
  riotPuuid: string | null;
  riotIgn: string | null;
  role: string | null;
  champId: number | null;
  champName: string | null;
  teamName: string | null;
  opposingTeamName: string | null;
};
export type PlayerStatRecordCreepScorePerMinuteDto = PlayerStatRecordBase & {
  creepScorePerMinute: number | null;
  creepScore: number | null;
};
export type PlayerStatRecordDamageDealtPerMinuteDto = PlayerStatRecordBase & {
  damageDealtPerMinute: number | null;
  damageDealt: number | null;
};
export type PlayerStatRecordVisionScorePerMinuteDto = PlayerStatRecordBase & {
  visionScorePerMinute: number | null;
  visionScore: number | null;
};
export type PlayerStatRecordKillsAt15Dto = PlayerStatRecordBase & {
  killsAt15: number | null;
};
export type PlayerStatRecordDamageAt15Dto = PlayerStatRecordBase & {
  damageAt15: number | null;
  damageDiff15: number | null;
};
export type PlayerStatRecordGoldAt15Dto = PlayerStatRecordBase & {
  goldAt15: number | null;
  goldDiff15: number | null;
};
export type PlayerStatRecordCsAt15Dto = PlayerStatRecordBase & {
  csAt15: number | null;
  csDiff15: number | null;
};
export type SplitDto = {
  split: SplitRow;
  teams: TeamRow[];
  rosterRequests: RosterRequestRow[];
  emergencySubRequests: EmergencySubRequestRow[];
  sideStats: SidesStatsDto | null;
  dragonStats: DragonStatsDto | null;
  gameStatRecords: {
    totalKills: GameStatRecordTotalKillsDto[] | null;
    totalKillsAt15: GameStatRecordTotalKillsAt15Dto[] | null;
    creepScorePerMinute: GameStatRecordCreepScorePerMinuteDto[] | null;
    goldPerMinute: GameStatRecordGoldPerMinuteDto[] | null;
    damagePerMinute: GameStatRecordDamagePerMinuteDto[] | null;
    visionScorePerMinute: GameStatRecordVisionScorePerMinuteDto[] | null;
  } | null;
  teamStatRecords: {
    firstTowerTimestamp: TeamStatRecordFirstTowerTimestampDto[] | null;
    firstBloodTimestamp: TeamStatRecordFirstBloodTimestampDto[] | null;
    firstInhibitorTimestamp: TeamStatRecordFirstInhibitorTimestampDto[] | null;
    killsAt15: TeamStatRecordKillsAt15Dto[] | null;
    goldDiff15: TeamStatRecordGoldAt15Dto[] | null;
    damageDiff15: TeamStatRecordDamageAt15Dto[] | null;
    wardsPlacedDiff15: TeamStatRecordWardsPlacedAt15Dto[] | null;
    wardsClearedDiff15: TeamStatRecordWardsClearedAt15Dto[] | null;
  } | null;
  playerStatRecords: {
    creepScorePerMinute: PlayerStatRecordCreepScorePerMinuteDto[] | null;
    damageDealtPerMinute: PlayerStatRecordDamageDealtPerMinuteDto[] | null;
    visionScorePerMinute: PlayerStatRecordVisionScorePerMinuteDto[] | null;
    damageAt15: PlayerStatRecordDamageAt15Dto[] | null;
    goldAt15: PlayerStatRecordGoldAt15Dto[] | null;
    csAt15: PlayerStatRecordCsAt15Dto[] | null;
  } | null;
};
export type SplitRecordsDto = {
  sides: SidesStatsDto;
  games: GameStatRecordBase[];
  players: PlayerStatRecordBase[];
};

// SplitTableDto
export type SplitTableDto = {
  split: SplitRow;
};
