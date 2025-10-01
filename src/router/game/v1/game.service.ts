import type {
  MatchV5DTOs,
  MatchV5TimelineDTOs,
} from 'twisted/dist/models-dto/index.js';

import {
  BannedChampsQuery,
  LeagueGamesQuery,
  PlayerStatsQuery,
  TeamStatsQuery,
} from '@/database/query.js';
import type {
  BannedChampRow,
  InsertGameEvent,
  InsertGameSkillLevelUp,
  InsertGameStoreAction,
  InsertGameTeamGold,
} from '@/database/schema.js';
import {
  LEAGUE_SIDES,
  type EventType,
  type LeagueLane,
  type LeagueRole,
  type LeagueSide,
  type SkillLevelUpTypes,
  type SkillSlots,
} from '@/database/shared.js';
import ControllerError from '@/util/errors/controllerError.js';
import type { GameDto, GameTableDto, TeamStatTableDto } from './game.dto.js';

type EarlyStats = {
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  cs: number | null;
  gold: number | null;
  xp: number | null;
  damage: number | null;
  wardsPlaced: number | null;
  wardsCleared: number | null;
};

type StatCounter = {
  kills: number;
  deaths: number;
  assists: number;
  wardsPlaced: number;
  wardsCleared: number;
};

export class GameService {
  /**
   * Maps a MatchV5DTOs.Position to our own defined role.
   */
  private static readonly ROLE_MAP: Record<MatchV5DTOs.Position, LeagueRole> = {
    TOP: 'Top',
    JUNGLE: 'Jungle',
    MIDDLE: 'Middle',
    BOTTOM: 'Bottom',
    UTILITY: 'Support',
    '': 'Unknown',
    Invalid: 'Unknown',
  };
  /**
   * Maps a MatchV5TimelineDTOs.TowerType to our own defined tower type.
   */
  private static readonly TOWER_TYPE_MAP: Record<
    MatchV5TimelineDTOs.TowerType,
    EventType
  > = {
    BASE_TURRET: 'Base_Tower',
    INNER_TURRET: 'Inner_Tower',
    NEXUS_TURRET: 'Nexus_Tower',
    OUTER_TURRET: 'Outer_Tower',
  };
  /**
   * Maps a MatchV5TimelineDTOs.SubMonsterType to our own defined dragon type.
   */
  private static readonly DRAGON_TYPE_MAP: Record<string, EventType> = {
    CHEMTECH_DRAGON: 'Chemtech_Drake',
    AIR_DRAGON: 'Cloud_Drake',
    HEXTECH_DRAGON: 'Hextech_Drake',
    FIRE_DRAGON: 'Infernal_Drake',
    EARTH_DRAGON: 'Mountain_Drake',
    WATER_DRAGON: 'Ocean_Drake',
    ELDER_DRAGON: 'Elder_Dragon',
  };
  /**
   * Maps a MatchV5TimelineDTOs.LaneType to our own defined lane type.
   */
  private static readonly LANE_TYPE_MAP: Record<
    MatchV5TimelineDTOs.LaneType,
    LeagueLane
  > = {
    TOP_LANE: 'Top',
    MID_LANE: 'Middle',
    BOT_LANE: 'Bottom',
  };
  /**
   * Maps a MatchV5TimelineDTOs.SkillSlot to the skill keyboard.
   */
  private static readonly SKILL_SLOT_MAP: Record<number, SkillSlots> = {
    1: 'Q',
    2: 'W',
    3: 'E',
    4: 'R',
  };

  /**
   * Maps a MatchV5TimelineDTOs.LevelUpType to our own defined skill
   *  level up type.
   */
  private static readonly LEVEL_UP_TYPE_MAP: Record<
    MatchV5TimelineDTOs.LevelUpType,
    SkillLevelUpTypes
  > = {
    NORMAL: 'Normal',
    EVOLVE: 'Evolve',
  };

  /**
   * Parses the riot data to create a singular entry of a game.
   *  Also inserts into game events, player stats, team stats, and banned
   *  champs.
   */
  public static create = async (
    leagueMatchId: string | null,
    blueTeamUuid: string | null,
    redTeamUuid: string | null,
    rawMatchData: MatchV5DTOs.MatchDto,
    rawTimelineData: MatchV5TimelineDTOs.MatchTimelineDto,
  ): Promise<GameDto> => {
    const { info } = rawMatchData;
    const { teams, participants } = info;
    const blueTeam = teams[0]?.teamId === 100 ? teams[0]! : teams[1]!;
    const redTeam = teams[0]?.teamId === 200 ? teams[0]! : teams[1]!;
    const { info: timelineInfo } = rawTimelineData;
    const { frames } = timelineInfo;

    // Insert into league_games table
    const gameData = await LeagueGamesQuery.insert({
      leagueMatchId,
      blueTeamId: blueTeamUuid,
      redTeamId: redTeamUuid,
      patch: info.gameVersion.split('.').slice(0, 1).join('.'),
      sideWin: blueTeam.win ? 'Blue' : 'Red',
      duration: info.gameDuration,
      startedAt: new Date(info.gameStartTimestamp).toISOString(),
    });
    const leagueGameId = gameData.id;

    // Insert into banned_champs table
    const addBannedChamps = async (
      team: MatchV5DTOs.TeamDto,
      side: LeagueSide,
      teamUuid: string | null,
      otherTeamUuid: string | null,
    ): Promise<BannedChampRow[]> => {
      return Promise.all(
        team.bans.map(
          async (b) =>
            await BannedChampsQuery.insert({
              leagueGameId,
              order: b.pickTurn,
              sideBannedBy: side,
              teamIdBanned: teamUuid,
              teamIdAgainst: otherTeamUuid,
              champId: b.championId,
            }),
        ),
      );
    };
    const bannedChampsData = await addBannedChamps(
      blueTeam,
      'Blue',
      blueTeamUuid,
      redTeamUuid,
    );
    bannedChampsData.push(
      ...(await addBannedChamps(redTeam, 'Red', redTeamUuid, blueTeamUuid)),
    );

    /** Key: participantId (i.e. 0, 1, 2, etc.) -> Value: riotPuuid */
    const puuidByParticipantId: Record<number, string> = {};
    /** Key: participantId -> Value: champId */
    const champIdByParticipantId: Record<number, number> = {};
    /** Key: participantId -> Value: teamId (i.e. 100 or 200) */
    const teamIdByParticipantId: Record<number, 100 | 200> = {};
    /** Key: puuid -> Value: Top/Jng/Mid/Bot/Sup */
    const roleByPuuid: Record<string, LeagueRole> = {};
    // Populate above objects from Match
    participants.forEach((player) => {
      const {
        participantId,
        puuid,
        championId,
        teamPosition,
        riotIdGameName,
        riotIdTagline,
        teamId,
        championName,
        role,
        lane,
      } = player;
      puuidByParticipantId[participantId] = puuid;
      champIdByParticipantId[participantId] = championId;
      teamIdByParticipantId[participantId] = teamId as 100 | 200;
      // Try to determine role from teamPosition first, then fall back to
      // role/lane if teamPosition is invalid or "Unknown".
      const leagueRole = this.ROLE_MAP[teamPosition];
      if (leagueRole) {
        roleByPuuid[puuid] = leagueRole;
      } else {
        // Just to get things out the door, I'll worry about this case
        // later if it happens.
        throw new ControllerError(
          400,
          'InvalidInput',
          'MatchV5DTO object has an invalid team position in a participant',
          {
            participantId,
            teamPosition,
            riotName: `${riotIdGameName}#${riotIdTagline}`,
            championName,
            role,
            lane,
          },
        );
      }
    });

    /**
     * Used for the following game events:
     *
     * BUILDING_KILL, CHAMPION_KILL, ELITE_MONSTER_KILL, TURRET_PLATE_DESTROYED
     *
     * Will be used later to insert into game_events table.
     */
    const gameEventList: InsertGameEvent[] = [];
    /**
     * Tracks item purchases and sells. Will be used later to insert into
     *  game_store_actions table.
     */
    const storeActionList: InsertGameStoreAction[] = [];
    /**
     * Tracks each player's skill leveling. Will be used later to insert into
     *  game_skill_level_ups table.
     */
    const skillLevelUpList: InsertGameSkillLevelUp[] = [];
    /**
     * Tracks team's total gold per minute. Will be used later to insert into
     *  game_team_golds table.
     */
    const teamGoldList: InsertGameTeamGold[] = [];
    const blueTeamGoldCounter: number = 0;
    const redTeamGoldCounter: number = 0;
    const initStatCounter: StatCounter = {
      kills: 0,
      deaths: 0,
      assists: 0,
      wardsPlaced: 0,
      wardsCleared: 0,
    };
    /**
     * Used to track KDA and wards placed/cleared for player stats table
     *
     * Key: participantId -> Value: KDA counter */
    const statCounterByParticipantId: Record<number, StatCounter> = {
      1: initStatCounter,
      2: initStatCounter,
      3: initStatCounter,
      4: initStatCounter,
      5: initStatCounter,
      6: initStatCounter,
      7: initStatCounter,
      8: initStatCounter,
      9: initStatCounter,
      10: initStatCounter,
    };
    /**
     * Used to track skill number per participant for skill level up events.
     *
     * Key: participantId -> Value: skill number (1-18)
     */
    const skillNumberByParticipantId: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
    };
    /** Used to calculate @ 10 & @ 15 statistics. */
    const initEarlyStatsTeam = {
      Top: {} as EarlyStats,
      Jungle: {} as EarlyStats,
      Middle: {} as EarlyStats,
      Bottom: {} as EarlyStats,
      Support: {} as EarlyStats,
      Unknown: undefined,
    };
    const atEarlyStatsByRole: Record<
      10 | 15,
      Record<100 | 200, Record<LeagueRole, EarlyStats | undefined>>
    > = {
      10: {
        100: initEarlyStatsTeam,
        200: initEarlyStatsTeam,
      },
      15: {
        100: initEarlyStatsTeam,
        200: initEarlyStatsTeam,
      },
    };

    // Populate above objects from Match timeline
    frames.forEach((frame, minute) => {
      const { participantFrames, events } = frame;
      for (const event of events) {
        const { type, timestamp } = event;
        switch (type) {
          case 'BUILDING_KILL': {
            const {
              buildingType,
              killerId,
              laneType,
              position,
              teamId,
              towerType,
            } = event;
            const eventType: EventType | null =
              buildingType === 'TOWER_BUILDING'
                ? (this.TOWER_TYPE_MAP[towerType!] ?? null)
                : 'Inhibitor';
            const lane = this.LANE_TYPE_MAP[laneType!] ?? null;
            gameEventList.push({
              leagueGameId,
              riotPuuidKiller: puuidByParticipantId[killerId!] || null,
              // This is reversed because in the Riot Api, the teamId is the
              //  team that LOST the tower, not the team that destroyed it.
              //  So if teamId is 100 (Blue), then the red team destroyed it.
              teamId: teamId === 100 ? redTeamUuid : blueTeamUuid,
              gameTimestamp: timestamp,
              lane,
              positionX: position?.x ?? null,
              positionY: position?.y ?? null,
              eventType,
            });
            break;
          }
          case 'CHAMPION_KILL': {
            const { assistingParticipantIds, killerId, position, victimId } =
              event;
            // Add to GameEventList
            gameEventList.push({
              leagueGameId,
              riotPuuidKiller: puuidByParticipantId[killerId!] || null,
              teamId:
                teamIdByParticipantId[killerId!] === 100
                  ? blueTeamUuid
                  : redTeamUuid,
              eventType: 'Kill',
              gameTimestamp: timestamp,
              positionX: position?.x ?? null,
              positionY: position?.y ?? null,
              riotPuuidVictim: puuidByParticipantId[victimId!] || null,
            });
            // Add to kdaCounter
            statCounterByParticipantId[killerId!]!.kills += 1;
            statCounterByParticipantId[victimId!]!.deaths += 1;
            assistingParticipantIds?.forEach((pId) => {
              statCounterByParticipantId[pId]!.assists += 1;
            });
            break;
          }
          case 'ELITE_MONSTER_KILL': {
            const {
              killerId,
              killerTeamId,
              monsterSubType,
              monsterType,
              position,
            } = event;
            const getMonsterType = (
              type: string,
              dragonType?: string,
            ): EventType | null => {
              if (type === 'BARON_NASHOR') return 'Baron_Nashor';
              if (type === 'RIFT_HERALD') return 'Rift_Herald';
              if (type === 'ATAKHAN') return 'Atakhan';
              if (type === 'HORDE') return 'Voidgrub';
              return dragonType
                ? (this.DRAGON_TYPE_MAP[dragonType] ?? null)
                : null;
            };
            // Calculate and assign baronPowerPlay
            const baronPowerPlay = monsterType === 'BARON_NASHOR' ? 180 : null;
            // Add to GameEventList
            gameEventList.push({
              leagueGameId,
              riotPuuidKiller: puuidByParticipantId[killerId!] || null,
              teamId: killerTeamId === 100 ? blueTeamUuid : redTeamUuid,
              eventType: getMonsterType(monsterType!, monsterSubType!),
              gameTimestamp: timestamp,
              positionX: position?.x ?? null,
              positionY: position?.y ?? null,
            });
            break;
          }
          case 'ITEM_PURCHASED': {
            const { itemId, participantId } = event;
            // Add to StoreActionList
            storeActionList.push({
              leagueGameId,
              riotPuuid: puuidByParticipantId[participantId!] || null,
              champId: champIdByParticipantId[participantId!] || null,
              gameTimestamp: timestamp,
              type: 'Purchase',
              itemId: itemId || null,
            });
            break;
          }
          case 'ITEM_SOLD': {
            const { itemId, participantId } = event;
            // Add to StoreActionList
            storeActionList.push({
              leagueGameId,
              riotPuuid: puuidByParticipantId[participantId!] || null,
              champId: champIdByParticipantId[participantId!] || null,
              gameTimestamp: timestamp,
              type: 'Sell',
              itemId: itemId || null,
            });
            break;
          }
          case 'SKILL_LEVEL_UP': {
            const { levelUpType, participantId, skillSlot } = event;
            // Add to SkillLevelUpList
            skillLevelUpList.push({
              leagueGameId,
              riotPuuid: puuidByParticipantId[participantId!] || null,
              champId: champIdByParticipantId[participantId!] || null,
              gameTimestamp: timestamp,
              skillNumber: skillNumberByParticipantId[participantId!]!++,
              skillSlot: this.SKILL_SLOT_MAP[skillSlot!] || null,
              type: this.LEVEL_UP_TYPE_MAP[levelUpType!] || null,
            });
            break;
          }
          case 'TURRET_PLATE_DESTROYED': {
            const { killerId, laneType, position, teamId } = event;
            // Add to GameEventList
            gameEventList.push({
              leagueGameId,
              riotPuuidKiller: puuidByParticipantId[killerId!] || null,
              // This is reversed because in the Riot Api, the teamId is the
              //  team that LOST the plate, not the team that destroyed it.
              //  So if teamId is 100 (Blue), then the red team destroyed it.
              teamId: teamId === 100 ? redTeamUuid : blueTeamUuid,
              eventType: 'Turret_Plate',
              gameTimestamp: timestamp,
              lane: this.LANE_TYPE_MAP[laneType!] || null,
              positionX: position?.x ?? null,
              positionY: position?.y ?? null,
            });
            break;
          }
          case 'WARD_KILL': {
            const { killerId } = event;
            // Increment statCounterByParticipantId
            statCounterByParticipantId[killerId!]!.wardsCleared += 1;
            break;
          }
          case 'WARD_PLACED': {
            const { creatorId } = event;
            // Increment statCounterByParticipantId
            statCounterByParticipantId[creatorId!]!.wardsPlaced += 1;
            break;
          }
        }
      }
      for (const participantFrame of Object.values(participantFrames)) {
        // Populate @10 & @15 statistics object
        if (minute === 10 || minute === 15) {
          const { damageStats, minionsKilled, participantId, totalGold, xp } =
            participantFrame;
          const role = roleByPuuid[puuidByParticipantId[participantId]!]!;
          atEarlyStatsByRole[minute][teamIdByParticipantId[participantId]!][
            role
          ]!.kills = statCounterByParticipantId[participantId]!.kills;
          atEarlyStatsByRole[minute][teamIdByParticipantId[participantId]!][
            role
          ]!.deaths = statCounterByParticipantId[participantId]!.deaths;
          atEarlyStatsByRole[minute][teamIdByParticipantId[participantId]!][
            role
          ]!.assists = statCounterByParticipantId[participantId]!.assists;
          atEarlyStatsByRole[minute][teamIdByParticipantId[participantId]!][
            role
          ]!.wardsPlaced =
            statCounterByParticipantId[participantId]!.wardsPlaced;
          atEarlyStatsByRole[minute][teamIdByParticipantId[participantId]!][
            role
          ]!.wardsCleared =
            statCounterByParticipantId[participantId]!.wardsCleared;
        }
      }
    });

    // Insert into player_stats table
    const playerStats = participants.map(async (player) => {
      const { participantId, puuid, riotIdGameName, riotIdTagline } = player;

      return await PlayerStatsQuery.insert({
        leagueGameId: leagueGameId,
        participantId,
        riotPuuid: puuid,
        riotIgn: `${riotIdGameName}#${riotIdTagline}`,
        playerRole: roleByPuuid[puuid]!,
        side: player.teamId === 100 ? 'Blue' : 'Red',
      });
    });

    // Insert into team_stats table

    // Insert into game_events table

    // Insert into game_store_actions table

    // Insert into game_skill_level_ups table

    // Insert into game_team_golds table

    return {
      game: gameData,
      bannedChamps: [],
      teamStats: [],
      playerStats: [],
      gameEvents: [],
      teamGoldTimeline: [],
      storeActions: [],
      skillLevelUps: [],
    };
  };

  /**
   * Retrieves a singular entry of a game.
   */
  public static findById = async (gameId: string): Promise<GameDto> => {
    const getGame = await LeagueGamesQuery.selectById(gameId);
    if (!getGame) {
      throw new ControllerError(404, 'NotFound', 'Game not found', {
        gameId,
      });
    }

    return {
      game: getGame,
      bannedChamps: [],
      teamStats: [],
      playerStats: [],
      gameEvents: [],
      teamGoldTimeline: [],
      storeActions: [],
      skillLevelUps: [],
    };
  };

  /**
   * Assigns a match to the game.
   */
  public static updateMatchIdInGame = async (
    gameId: string,
    matchId: string,
  ): Promise<GameTableDto> => {
    const patchedGame = await LeagueGamesQuery.setMatchId(gameId, matchId);
    if (!patchedGame) {
      throw new ControllerError(404, 'NotFound', 'Game not found', {
        gameId,
      });
    }

    return {
      game: patchedGame,
    };
  };

  /**
   * Assigns a team to the team stats based on their side.
   */
  public static updateTeamIdInTeamStats = async (
    gameId: string,
    side: string,
    teamId: string,
  ): Promise<TeamStatTableDto> => {
    const sideString =
      side === LEAGUE_SIDES[0].toLowerCase()
        ? LEAGUE_SIDES[0]
        : side === LEAGUE_SIDES[1].toLowerCase()
          ? LEAGUE_SIDES[1]
          : null;
    if (!sideString) {
      throw new ControllerError(400, 'InvalidInput', 'Side not a valid input', {
        side,
      });
    }

    const patchedTeamStat = await TeamStatsQuery.setTeamId(
      gameId,
      sideString,
      teamId,
    );
    if (!patchedTeamStat) {
      throw new ControllerError(404, 'NotFound', 'Game not found', {
        gameId,
      });
    }

    return {
      teamStat: patchedTeamStat,
    };
  };

  /**
   * Deletes a singular entry of a game.
   */
  public static removeById = async (gameId: string): Promise<GameTableDto> => {
    const deletedGame = await LeagueGamesQuery.deleteById(gameId);
    if (!deletedGame) {
      throw new ControllerError(404, 'NotFound', 'Game not found', {
        gameId,
      });
    }

    return {
      game: deletedGame,
    };
  };
}
