import {
  EmergencySubRequestsQuery,
  LeagueGamesQuery,
  PlayerStatsQuery,
  RosterRequestsQuery,
  SplitsQuery,
  TeamsQuery,
  TeamStatsQuery,
} from '@/database/query.js';
import type { InsertSplit, UpdateSplit } from '@/database/schema.js';
import type {
  GamesSplitDto,
  PlayerStatsSplitDto,
  SplitDto,
  SplitTableDto,
  TeamStatsSplitDto,
} from '@/router/split/v1/split.dto.js';
import ControllerError from '@/util/errors/controllerError.js';

export class SplitService {
  /**
   * Creates a singular entry of a split.
   */
  public static create = async (splitData: InsertSplit): Promise<SplitDto> => {
    const insertedSplit = await SplitsQuery.insert(splitData);

    return {
      split: insertedSplit,
      teams: [],
      rosterRequests: [],
      emergencySubRequests: [],
      sideStats: null,
      dragonStats: null,
      gameStatRecords: null,
      teamStatRecords: null,
      playerStatRecords: null,
    };
  };

  /**
   * Retrieves a singular entry of a split.
   */
  public static findById = async (splitId: string): Promise<SplitDto> => {
    const getSplit = await SplitsQuery.selectById(splitId);
    if (!getSplit) {
      throw new ControllerError(404, 'NotFound', 'Split not found', {
        splitId,
      });
    }
    const getTeams = await TeamsQuery.listBySplitId(splitId);
    const getRosterRequests = await RosterRequestsQuery.listBySplitId(splitId);
    const getEmergencySubRequests =
      await EmergencySubRequestsQuery.listBySplitId(splitId);
    const getSidesStats = await LeagueGamesQuery.selectSidesBySplitId(splitId);
    const getDragonStats =
      await LeagueGamesQuery.selectDragonsBySplitId(splitId);
    const getSingleGameRecords = {
      totalKills:
        (await LeagueGamesQuery.listTotalKillsRecordsBySplitId(splitId)) ??
        null,
      totalKillsAt15:
        (await LeagueGamesQuery.listTotalKillsAt15RecordsBySplitId(splitId)) ??
        null,
      creepScorePerMinute:
        (await LeagueGamesQuery.listCreepScorePerMinuteRecordsBySplitId(
          splitId,
        )) ?? null,
      goldPerMinute:
        (await LeagueGamesQuery.listGoldPerMinuteRecordsBySplitId(splitId)) ??
        null,
      damagePerMinute:
        (await LeagueGamesQuery.listDamagePerMinuteRecordsBySplitId(splitId)) ??
        null,
      visionScorePerMinute:
        (await LeagueGamesQuery.listVisionScorePerMinuteRecordsBySplitId(
          splitId,
        )) ?? null,
    };
    const getTeamStatRecords = {
      firstTowerTimestamp:
        (await TeamStatsQuery.listFirstTowerTimestampRecordsBySplitId(
          splitId,
        )) ?? null,
      firstBloodTimestamp:
        (await TeamStatsQuery.listFirstBloodTimestampRecordsBySplitId(
          splitId,
        )) ?? null,
      firstInhibitorTimestamp:
        (await TeamStatsQuery.listFirstInhibitorTimestampRecordsBySplitId(
          splitId,
        )) ?? null,
      killsAt15:
        (await TeamStatsQuery.listKillsAt15RecordsBySplitId(splitId)) ?? null,
      goldDiff15:
        (await TeamStatsQuery.listGoldAt15RecordsBySplitId(splitId)) ?? null,
      damageDiff15:
        (await TeamStatsQuery.listDamageAt15RecordsBySplitId(splitId)) ?? null,
      wardsPlacedDiff15:
        (await TeamStatsQuery.listWardsPlacedAt15RecordsBySplitId(splitId)) ??
        null,
      wardsClearedDiff15:
        (await TeamStatsQuery.listWardsClearedAt15RecordsBySplitId(splitId)) ??
        null,
    };
    const getPlayerStatRecords = {
      creepScorePerMinute:
        (await PlayerStatsQuery.listCreepScorePerMinuteRecordsBySplitId(
          splitId,
        )) ?? null,
      damageDealtPerMinute:
        (await PlayerStatsQuery.listDamageDealtPerMinuteRecordsBySplitId(
          splitId,
        )) ?? null,
      visionScorePerMinute:
        (await PlayerStatsQuery.listVisionScorePerMinuteRecordsBySplitId(
          splitId,
        )) ?? null,
      damageAt15:
        (await PlayerStatsQuery.listDamageAt15RecordsBySplitId(splitId)) ??
        null,
      goldAt15:
        (await PlayerStatsQuery.listGoldAt15RecordsBySplitId(splitId)) ?? null,
      csAt15:
        (await PlayerStatsQuery.listCsAt15RecordsBySplitId(splitId)) ?? null,
    };

    return {
      split: getSplit,
      teams: getTeams,
      rosterRequests: getRosterRequests,
      emergencySubRequests: getEmergencySubRequests,
      sideStats: getSidesStats ?? null,
      dragonStats: getDragonStats ?? null,
      gameStatRecords: getSingleGameRecords ?? null,
      teamStatRecords: getTeamStatRecords ?? null,
      playerStatRecords: getPlayerStatRecords ?? null,
    };
  };

  /**
   * Retrieves player stats for a singular split.
   */
  public static findPlayerStatsBySplitId = async (
    splitId: string,
  ): Promise<PlayerStatsSplitDto> => {
    const getSplit = await SplitsQuery.selectById(splitId);
    if (!getSplit) {
      throw new ControllerError(404, 'NotFound', 'Split not found', {
        splitId,
      });
    }
    const getPlayerStats = await PlayerStatsQuery.listOverallBySplitId(splitId);

    return {
      players: getPlayerStats,
    };
  };

  /**
   * Retrieves team stats for a singular split.
   */
  public static findTeamStatsBySplitId = async (
    splitId: string,
  ): Promise<TeamStatsSplitDto> => {
    const getSplit = await SplitsQuery.selectById(splitId);
    if (!getSplit) {
      throw new ControllerError(404, 'NotFound', 'Split not found', {
        splitId,
      });
    }
    const getTeamStats = await TeamStatsQuery.listOverallBySplitId(splitId);

    return {
      teams: getTeamStats,
    };
  };

  /**
   * Retrieves games for a singular split.
   */
  public static findGamesBySplitId = async (
    splitId: string,
  ): Promise<GamesSplitDto> => {
    const getSplit = await SplitsQuery.selectById(splitId);
    if (!getSplit) {
      throw new ControllerError(404, 'NotFound', 'Split not found', {
        splitId,
      });
    }

    const getGames = await LeagueGamesQuery.listBySplitId(splitId);
    return {
      games: getGames,
    };
  };

  /**
   * Updates a singular entry of a split.
   */
  public static replaceById = async (
    splitId: string,
    splitData: UpdateSplit,
  ): Promise<SplitTableDto> => {
    const updatedSplit = await SplitsQuery.updateById(splitId!, splitData);
    if (!updatedSplit) {
      throw new ControllerError(404, 'NotFound', 'Split not found', {
        splitId,
      });
    }

    return {
      split: updatedSplit,
    };
  };

  /**
   * Deletes a singular entry of a split.
   */
  public static removeById = async (
    splitId: string,
  ): Promise<SplitTableDto> => {
    const deletedSplit = await SplitsQuery.deleteById(splitId);
    if (!deletedSplit) {
      throw new ControllerError(404, 'NotFound', 'Split not found', {
        splitId,
      });
    }

    return {
      split: deletedSplit,
    };
  };
}
