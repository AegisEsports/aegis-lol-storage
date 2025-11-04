import type {
  EmergencySubRequestRow,
  RosterRequestRow,
  SplitRow,
  TeamRow,
} from '@/database/schema.js';
import type { LeagueSide } from '@/database/shared.js';

// SplitDto
export type SidesStatsDto = {
  blueWins: number | null;
  redWins: number | null;
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

// PlayerStatsSplitDto
export type PlayerStatOverallDto = {
  userId: string | null;
  userName: string | null;
  role: string | null;
  gamesPlayed: number | null;
  // core/tallies
  totalKills: number | null;
  totalDeaths: number | null;
  totalAssists: number | null;
  totalFirstBloodTakedowns: number | null;
  totalSoloKills: number | null;
  totalDoubleKills: number | null;
  totalTripleKills: number | null;
  totalQuadraKills: number | null;
  totalPentaKills: number | null;
  // average tallies
  averageDamageToChamps: number | null;
  standardDeviationDamageToChamps: number | null;
  averageDamageToChampsPerMinute: number | null;
  averageGoldPerMinute: number | null;
  averageCreepScorePerMinute: number | null;
  averageVisionScorePerMinute: number | null;
  averageWardsPlacedPerMinute: number | null;
  averageWardTakedownsPerMinute: number | null;
  // average timelines
  averageKillsAt10: number | null;
  averageKillsAt15: number | null;
  averageKillsAt20: number | null;
  averageCsAt10: number | null;
  averageCsAt15: number | null;
  averageCsAt20: number | null;
  averageGoldAt10: number | null;
  averageGoldAt15: number | null;
  averageGoldAt20: number | null;
  averageXpAt10: number | null;
  averageXpAt15: number | null;
  averageXpAt20: number | null;
  averageDamageAt10: number | null;
  averageDamageAt15: number | null;
  averageDamageAt20: number | null;
  averageWardsPlacedAt20: number | null;
  averageWardTakedownsBefore20: number | null;
  // average diff stats
  averageDamageDealtPerMinuteDiff: number | null;
  averageCsDiff10: number | null;
  averageCsDiff15: number | null;
  averageCsDiff20: number | null;
  averageGoldDiff10: number | null;
  averageGoldDiff15: number | null;
  averageGoldDiff20: number | null;
  averageXpDiff10: number | null;
  averageXpDiff15: number | null;
  averageXpDiff20: number | null;
  averageDamageDiff10: number | null;
  averageDamageDiff15: number | null;
  averageDamageDiff20: number | null;
  averageWardsDiff20: number | null;
  averageWardTakedownDiff20: number | null;
};
export type PlayerStatsSplitDto = {
  players: PlayerStatOverallDto[];
};

// TeamStatsSplitDto
export type TeamStatOverallDto = {
  teamId: string;
  teamName: string | null;
  teamAbbreviation: string | null;
  averageDuration: number | null;
  gamesPlayed: number | null;
  totalWins: number | null;
  totalLosses: number | null;
  // core/tallies
  totalKills: number | null;
  totalDeaths: number | null;
  totalFirstBloods: number | null;
  totalFirstTowers: number | null;
  totalFirstInhibitors: number | null;
  totalFirstVoidGrubs: number | null;
  totalFirstDragons: number | null;
  totalFirstHeralds: number | null;
  totalFirstAtakhan: number | null;
  totalFirstBarons: number | null;
  // average tallies
  averageDamageToChampsPerMinute: number | null;
  averageGoldPerMinute: number | null;
  averageCreepScorePerMinute: number | null;
  averageVisionScorePerMinute: number | null;
  averageWardsPlacedPerMinute: number | null;
  averageWardTakedownsPerMinute: number | null;
  // average timelines
  averageKillsAt10: number | null;
  averageKillsAt15: number | null;
  averageKillsAt20: number | null;
  averageCsAt10: number | null;
  averageCsAt15: number | null;
  averageCsAt20: number | null;
  averageGoldAt10: number | null;
  averageGoldAt15: number | null;
  averageGoldAt20: number | null;
  averageXpAt10: number | null;
  averageXpAt15: number | null;
  averageXpAt20: number | null;
  averageDamageAt10: number | null;
  averageDamageAt15: number | null;
  averageDamageAt20: number | null;
  averageWardsPlacedAt10: number | null;
  averageWardsPlacedAt15: number | null;
  averageWardsPlacedAt20: number | null;
  averageWardsCleared10: number | null;
  averageWardsCleared15: number | null;
  averageWardsCleared20: number | null;
  // average diff stats
  averageKillsDiff10: number | null;
  averageKillsDiff15: number | null;
  averageKillsDiff20: number | null;
  averageCsDiff10: number | null;
  averageCsDiff15: number | null;
  averageCsDiff20: number | null;
  averageGoldDiff10: number | null;
  averageGoldDiff15: number | null;
  averageGoldDiff20: number | null;
  averageXpDiff10: number | null;
  averageXpDiff15: number | null;
  averageXpDiff20: number | null;
  averageDamageDiff10: number | null;
  averageDamageDiff15: number | null;
  averageDamageDiff20: number | null;
  averageWardsDiff10: number | null;
  averageWardsDiff15: number | null;
  averageWardsDiff20: number | null;
  averageWardTakedownDiff10: number | null;
  averageWardTakedownDiff15: number | null;
  averageWardTakedownDiff20: number | null;
};
export type TeamStatsSplitDto = {
  teams: TeamStatOverallDto[];
};

// GamesSplitDto
export type TeamGameStatDto = {
  kills: number | null;
  gold: number | null;
  towers: number | null;
  voidGrubs: number | null;
  dragons: string[]; // dragon types
  heralds: number | null;
  atakhans: number | null;
  barons: number | null;
  inhibitors: number | null;
};
export type GameDetailDto = {
  leagueGameId: string;
  leagueMatchId: string | null;
  playedAt: string | null;
  redTeamId: string | null;
  redTeamName: string | null;
  blueTeamId: string | null;
  blueTeamName: string | null;
  invalidated: boolean;
  sideWin: string | null;
  blueTeamStat: TeamGameStatDto;
  redTeamStat: TeamGameStatDto;
};
export type GamesSplitDto = {
  games: GameDetailDto[];
};

// ChampionStatsSplitDto
export type ChampionPickRecord = {
  leagueMatchId: string;
  leagueGameId: string;
  gameNumber: number;
  side: LeagueSide | null;
  champId: number;
  win: boolean | null;
};
export type ChampionBanRecord = {
  leagueMatchId: string;
  leagueGameId: string;
  gameNumber: number;
  side: LeagueSide | null;
  champId: number;
  banOrder: number | null;
};
export type ChampionStatOverallDto = {
  champId: number;
  picks: number;
  bans: number;
  priorityScore: number; // Calculated in percentage
  presence: number; // Calculated in percentage
  bluePicks: number;
  redPicks: number;
  blueBans: number;
  redBans: number;
  wins: number;
  losses: number;
  averageBanOrder: number;
};
export type ChampionStatsSplitDto = {
  champions: ChampionStatOverallDto[];
};

// SplitTableDto
export type SplitTableDto = {
  split: SplitRow;
};
