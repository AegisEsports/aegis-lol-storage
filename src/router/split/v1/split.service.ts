import {
  BannedChampsQuery,
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
  ChampionStatOverallDto,
  ChampionStatsSplitDto,
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
   * Retrieves champion stats for a singular split.
   */
  public static findChampionStatsBySplitId = async (
    splitId: string,
  ): Promise<ChampionStatsSplitDto> => {
    const getSplit = await SplitsQuery.selectById(splitId);
    if (!getSplit) {
      throw new ControllerError(404, 'NotFound', 'Split not found', {
        splitId,
      });
    }

    // Will need to do some extensive logic here outside of sql query work.
    const championStatMap: Map<number, ChampionStatOverallDto> = new Map();
    /** Initialize new object */
    const initChampionStatOverall = (
      champId: number,
    ): ChampionStatOverallDto => ({
      champId,
      picks: 0,
      bans: 0,
      priorityScore: 0,
      presence: 0,
      bluePicks: 0,
      redPicks: 0,
      blueBans: 0,
      redBans: 0,
      wins: 0,
      losses: 0,
      averageBanOrder: 0,
    });
    // Calculate priorityValue by match
    // Pick - Based on what game the pick is made:
    //  Game 1 pick = 3
    //  Game 2 pick = 2
    //  Game 3, 4, 5 pick = 1
    //  Not picked = 0
    // Ban - Based on the earliest game the champ was banned:
    //  Game 1 ban = 3
    //  Game 2 ban = 2
    //  Game 3, 4, 5 ban = 1
    //  Not banned = 0
    // Champ = Max(Pick, Ban)
    //
    // Construct map #1 of matchId -> champId -> priorityValue
    // Construct map #2 of matchId -> Set<number> (champIds that were present in the match)
    const GAME_NUMBER_PRIORITY_MAP: Record<number, number> = Object.freeze({
      1: 3,
      2: 2,
      3: 1,
      4: 1,
      5: 1,
    });
    const priorityMap: Map<string, Map<number, number>> = new Map();
    const presenceMap: Map<string, Set<number>> = new Map();
    /** Helper function to update the priority and presence maps */
    const addToPriorityPresenceMaps = (
      leagueMatchId: string,
      champId: number,
      gameNumber: number,
    ) => {
      if (!priorityMap.has(leagueMatchId)) {
        priorityMap.set(leagueMatchId, new Map());
      }
      const matchPriorityMap = priorityMap.get(leagueMatchId)!;
      const existingPriority = matchPriorityMap.get(champId) ?? 0;
      // Update to the higher priority value
      matchPriorityMap.set(
        champId,
        Math.max(existingPriority, GAME_NUMBER_PRIORITY_MAP[gameNumber] ?? 0),
      );
      // Add to presence set
      if (!presenceMap.has(leagueMatchId)) {
        presenceMap.set(leagueMatchId, new Set());
      }
      presenceMap.get(leagueMatchId)!.add(champId);
    };
    // Process champion picks
    const getChampionPicks =
      await PlayerStatsQuery.listChampionPicksBySplitId(splitId);
    for (const pick of getChampionPicks) {
      if (!championStatMap.has(pick.champId)) {
        championStatMap.set(
          pick.champId,
          initChampionStatOverall(pick.champId),
        );
      }
      const overall = championStatMap.get(pick.champId)!;
      overall.picks += 1;
      if (pick.side === 'Blue') {
        overall.bluePicks += 1;
      } else {
        overall.redPicks += 1;
      }
      overall.wins += pick.win ? 1 : 0;
      overall.losses += pick.win ? 0 : 1;
      addToPriorityPresenceMaps(
        pick.leagueMatchId,
        pick.champId,
        pick.gameNumber,
      );
    }
    // Process champion bans
    const getChampionBans =
      await BannedChampsQuery.listChampionBansBySplitId(splitId);
    for (const ban of getChampionBans) {
      if (!championStatMap.has(ban.champId)) {
        championStatMap.set(ban.champId, initChampionStatOverall(ban.champId));
      }
      const overall = championStatMap.get(ban.champId)!;
      overall.bans += 1;
      if (ban.side === 'Blue') {
        overall.blueBans += 1;
      } else {
        overall.redBans += 1;
      }
      overall.averageBanOrder! += ban.banOrder ?? 0;
      addToPriorityPresenceMaps(ban.leagueMatchId, ban.champId, ban.gameNumber);
    }
    // Aggregate priority and presence from the maps
    for (const matchPriority of priorityMap.values()) {
      for (const [champId, priorityScore] of matchPriority.entries()) {
        const overall = championStatMap.get(champId);
        if (overall) {
          overall.priorityScore += priorityScore;
        }
      }
    }
    for (const matchPresence of presenceMap.values()) {
      for (const champId of matchPresence.values()) {
        const overall = championStatMap.get(champId);
        if (overall) {
          overall.presence += 1;
        }
      }
    }
    // Finalize calculations by normalizing priorityScore and presence to percentages
    const numberOfMatches = presenceMap.size;
    for (const overall of championStatMap.values()) {
      overall.priorityScore =
        (overall.priorityScore / (numberOfMatches * 3)) * 100;
      overall.presence = (overall.presence / numberOfMatches) * 100;
      overall.averageBanOrder =
        overall.averageBanOrder && overall.bans
          ? overall.averageBanOrder / overall.bans
          : null;
    }

    return {
      champions: Array.from(championStatMap.values()),
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
