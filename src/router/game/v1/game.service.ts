import { RegionGroups } from 'twisted/dist/constants/regions.js';
import type {
  MatchV5DTOs,
  MatchV5TimelineDTOs,
} from 'twisted/dist/models-dto/index.js';

import {
  BannedChampsQuery,
  GameEventsQuery,
  GameSkillLevelUpsQuery,
  GameStoreActionsQuery,
  GameTeamGoldsQuery,
  LeagueGamesQuery,
  PlayerStatsQuery,
  RiotAccountsQuery,
  TeamsQuery,
  TeamStatsQuery,
  UsersQuery,
} from '@/database/query.js';
import type {
  BannedChampRow,
  InsertGameEvent,
  InsertGameSkillLevelUp,
  InsertGameStoreAction,
  InsertGameTeamGold,
  InsertPlayerStat,
  InsertTeamStat,
} from '@/database/schema.js';
import {
  removeBaseFields,
  type EventType,
  type LeagueLane,
  type LeagueRole,
  type LeagueSide,
  type SkillLevelUpTypes,
  type SkillSlots,
} from '@/database/shared.js';
import { RiotApiClient } from '@/riotApi/riotApiClient.js';
import ControllerError from '@/util/errors/controllerError.js';
import type {
  GameDto,
  GameTableDto,
  PlayerStatDto,
  TeamStatDto,
} from './game.dto.js';

type StatCounter = {
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
   *
   * Additionally, the service will create a Riot account if the puuid is not
   *  present.
   */
  public static create = async (
    leagueMatchId: string | null,
    blueTeamUuid: string,
    redTeamUuid: string,
    riotMatchId: string,
  ): Promise<GameDto> => {
    // Call the Riot API with twisted.
    const riotApiClient = new RiotApiClient();
    const rawMatchData = await riotApiClient.getMatch(
      riotMatchId,
      RegionGroups.AMERICAS,
    );
    const rawTimelineData = await riotApiClient.getMatchTimeline(
      riotMatchId,
      RegionGroups.AMERICAS,
    );

    const { info } = rawMatchData;
    const { teams, participants } = info;
    const blueTeam = teams[0]?.teamId === 100 ? teams[0]! : teams[1]!;
    const redTeam = teams[0]?.teamId === 200 ? teams[0]! : teams[1]!;
    const { info: timelineInfo } = rawTimelineData;
    const { frames } = timelineInfo;

    // Insert into league_games table in order to generate a parent id
    const gameData = await LeagueGamesQuery.insert({
      leagueMatchId,
      blueTeamId: blueTeamUuid,
      redTeamId: redTeamUuid,
      patch: info.gameVersion.split('.').slice(0, 2).join('.'),
      sideWin: blueTeam.win ? 'Blue' : 'Red',
      duration: info.gameDuration,
      startedAt: new Date(info.gameStartTimestamp).toISOString(),
    });
    const leagueGameId = gameData.id;

    /**
     * Compute team golds at a specific minute mark (i.e. 10 or 15).
     */
    const teamGoldsAtMinute = (
      minute: number,
    ): Record<100 | 200, number> | null => {
      const frame = frames[minute];
      if (!frame) {
        return null;
      }
      const { participantFrames } = frame;
      let blueTeamGold = 0;
      let redTeamGold = 0;
      Object.values(participantFrames).forEach((pf) => {
        const { participantId, totalGold } = pf;
        const teamId = teamIdByParticipantId[participantId];
        if (teamId === 100) {
          blueTeamGold += totalGold;
        } else if (teamId === 200) {
          redTeamGold += totalGold;
        }
      });
      return { 100: blueTeamGold, 200: redTeamGold };
    };

    /**
     * Computes the team gold at a given timestamp (in seconds).
     *  If the timestamp is not exactly on a minute, a best guess calculation
     *  based on linear approximation will be used.
     */
    const computeTeamGoldAtTimestamp = (
      timestamp: number,
      teamId: 100 | 200,
    ): number | null => {
      const timestampMinute = Math.floor(timestamp / 60);
      const timestampSeconds = timestamp % 60;
      // Take team gold at marked minute, and from minute + 1. Average them.
      const teamGolds = teamGoldsAtMinute(timestampMinute);
      if (!teamGolds) {
        return null;
      }
      const teamGoldAtMinute = teamId === 100 ? teamGolds[100] : teamGolds[200];
      const teamGoldsNext = teamGoldsAtMinute(timestampMinute + 1);
      if (!teamGoldsNext || timestampSeconds === 0) {
        return teamGoldAtMinute;
      }
      const teamGoldAtNextMinute =
        teamId === 100 ? teamGoldsNext[100] : teamGoldsNext[200];
      return Math.round(
        teamGoldAtMinute +
          (teamGoldAtNextMinute - teamGoldAtMinute) * (timestampSeconds / 60),
      );
    };

    /**
     * Computes the baron power play for a team given the timestamp of the kill
     */
    const computeBaronPowerPlay = (
      timestamp: number,
      teamId: 100 | 200,
    ): number | null => {
      const BARON_DURATION = 3 * 60; // 3 minutes
      const opposingTeamId = teamId === 100 ? 200 : 100;
      const baronTimestamp = timestamp / 1000; // convert to seconds
      const teamGoldAtKill = computeTeamGoldAtTimestamp(baronTimestamp, teamId);
      const opposingTeamGoldAtKill = computeTeamGoldAtTimestamp(
        baronTimestamp,
        opposingTeamId,
      );
      if (!teamGoldAtKill || !opposingTeamGoldAtKill) {
        return null;
      }
      const teamGoldAtEnd = computeTeamGoldAtTimestamp(
        baronTimestamp + BARON_DURATION,
        teamId,
      );
      const opposingTeamGoldAtEnd = computeTeamGoldAtTimestamp(
        baronTimestamp + BARON_DURATION,
        opposingTeamId,
      );
      if (!teamGoldAtEnd || !opposingTeamGoldAtEnd) {
        return null;
      }
      return Math.round(
        teamGoldAtEnd -
          teamGoldAtKill -
          (opposingTeamGoldAtEnd - opposingTeamGoldAtKill),
      );
    };

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
    /** Initializes a StatCounter object by defaulting counters to 0. */
    const initStatCounter = (): StatCounter => ({
      kills: 0,
      deaths: 0,
      assists: 0,
      cs: 0,
      gold: 0,
      xp: 0,
      damage: 0,
      wardsPlaced: 0,
      wardsCleared: 0,
    });
    /**
     * Used to track stats (i.e. kda, wards, etc.) for the player stats table
     *
     * Key: participantId -> Value: StatCounter
     *
     * NOTE: ParticipantIds 0 counts as non-player, like turrets, minions, monsters.
     */
    const statCounterByParticipantId: Record<number, StatCounter> = {
      0: initStatCounter(),
      1: initStatCounter(),
      2: initStatCounter(),
      3: initStatCounter(),
      4: initStatCounter(),
      5: initStatCounter(),
      6: initStatCounter(),
      7: initStatCounter(),
      8: initStatCounter(),
      9: initStatCounter(),
      10: initStatCounter(),
    };
    /**
     * Used to track skill number per participant for skill level up events.
     *
     * Key: participantId -> Value: skill number (1-18)
     *
     * NOTE: participantId 0 counts as non-player, like turrets, minions, monsters.
     */
    const skillNumberByParticipantId: Record<number, number> = {
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 1,
      6: 1,
      7: 1,
      8: 1,
      9: 1,
      10: 1,
    };
    /** Initializes an early timeline stats object. */
    const makeEarlyStatsTeam = (): Record<
      LeagueRole,
      StatCounter | undefined
    > => ({
      Top: initStatCounter(),
      Jungle: initStatCounter(),
      Middle: initStatCounter(),
      Bottom: initStatCounter(),
      Support: initStatCounter(),
      Unknown: undefined,
    });
    // const initEarlyStatsTeam: Record<LeagueRole, StatCounter | undefined> = {
    //   Top: makeCounter(),
    //   Jungle: makeCounter(),
    //   Middle: makeCounter(),
    //   Bottom: makeCounter(),
    //   Support: makeCounter(),
    //   Unknown: undefined,
    // };
    /** Used to calculate @ 10 & @ 15 statistics by player. */
    const atEarlyStatsByRole: Record<
      10 | 15 | 20,
      Record<100 | 200, Record<LeagueRole, StatCounter | undefined>>
    > = {
      10: {
        100: makeEarlyStatsTeam(),
        200: makeEarlyStatsTeam(),
      },
      15: {
        100: makeEarlyStatsTeam(),
        200: makeEarlyStatsTeam(),
      },
      20: {
        100: makeEarlyStatsTeam(),
        200: makeEarlyStatsTeam(),
      },
    };
    /** participantId of the player who died first */
    let firstBloodVictimId = 0;
    let firstBlood = true;

    // Populate above objects from Match timeline
    frames.forEach((frame, minute) => {
      const { participantFrames, events } = frame;
      // Parse through events in the frame.
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
            statCounterByParticipantId[killerId!]!.kills! += 1;
            statCounterByParticipantId[victimId!]!.deaths! += 1;
            assistingParticipantIds?.forEach((pId) => {
              statCounterByParticipantId[pId]!.assists! += 1;
            });
            // Update first blood info
            if (firstBlood && victimId) {
              firstBloodVictimId = victimId;
              firstBlood = false;
            }
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
            // Add to GameEventList
            if (killerId && killerId > 0) {
              gameEventList.push({
                leagueGameId,
                riotPuuidKiller: puuidByParticipantId[killerId!] || null,
                teamId: killerTeamId === 100 ? blueTeamUuid : redTeamUuid,
                eventType: getMonsterType(monsterType!, monsterSubType!),
                gameTimestamp: timestamp,
                positionX: position?.x ?? null,
                positionY: position?.y ?? null,
                baronPowerPlay:
                  monsterType === 'BARON_NASHOR'
                    ? computeBaronPowerPlay(
                        timestamp,
                        killerTeamId as 100 | 200,
                      )
                    : null,
              });
            }
            break;
          }
          case 'ITEM_PURCHASED': {
            const { itemId, participantId } = event;
            // Add to StoreActionList
            if (participantId && participantId > 0) {
              storeActionList.push({
                leagueGameId,
                riotPuuid: puuidByParticipantId[participantId!] || null,
                champId: champIdByParticipantId[participantId!] || null,
                gameTimestamp: timestamp,
                type: 'Purchase',
                itemId: itemId || null,
              });
            }

            break;
          }
          case 'ITEM_SOLD': {
            const { itemId, participantId } = event;
            // Add to StoreActionList
            if (participantId && participantId > 0) {
              storeActionList.push({
                leagueGameId,
                riotPuuid: puuidByParticipantId[participantId!] || null,
                champId: champIdByParticipantId[participantId!] || null,
                gameTimestamp: timestamp,
                type: 'Sell',
                itemId: itemId || null,
              });
            }
            break;
          }
          case 'SKILL_LEVEL_UP': {
            const { levelUpType, participantId, skillSlot } = event;
            // Add to SkillLevelUpList
            if (participantId && participantId > 0) {
              skillLevelUpList.push({
                leagueGameId,
                riotPuuid: puuidByParticipantId[participantId] || null,
                champId: champIdByParticipantId[participantId] || null,
                gameTimestamp: timestamp,
                skillNumber: skillNumberByParticipantId[participantId]!++,
                skillSlot: this.SKILL_SLOT_MAP[skillSlot!] || null,
                type: this.LEVEL_UP_TYPE_MAP[levelUpType!] || null,
              });
            }
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
          case 'WARD_PLACED': {
            const { creatorId } = event;
            // Increment statCounterByParticipantId
            statCounterByParticipantId[creatorId!]!.wardsPlaced! += 1;
            break;
          }
          case 'WARD_KILL': {
            const { killerId } = event;
            // Increment statCounterByParticipantId
            statCounterByParticipantId[killerId!]!.wardsCleared! += 1;
            break;
          }
        }
      }
      // Parse through participantFrames in the frame.
      for (const participantFrame of Object.values(participantFrames)) {
        const {
          participantId,
          damageStats,
          minionsKilled,
          jungleMinionsKilled,
          totalGold,
          xp,
        } = participantFrame;
        statCounterByParticipantId[participantId]!.cs! =
          minionsKilled + jungleMinionsKilled;
        statCounterByParticipantId[participantId]!.gold! = totalGold;
        statCounterByParticipantId[participantId]!.xp! = xp;
        statCounterByParticipantId[participantId]!.damage! =
          damageStats?.totalDamageDoneToChampions ?? 0;
        // Populate @10 & @15 statistics object
        if (minute === 10 || minute === 15 || minute === 20) {
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
          ]!.cs = statCounterByParticipantId[participantId]!.cs;
          atEarlyStatsByRole[minute][teamIdByParticipantId[participantId]!][
            role
          ]!.gold = statCounterByParticipantId[participantId]!.gold;
          atEarlyStatsByRole[minute][teamIdByParticipantId[participantId]!][
            role
          ]!.xp = statCounterByParticipantId[participantId]!.xp;
          atEarlyStatsByRole[minute][teamIdByParticipantId[participantId]!][
            role
          ]!.damage = statCounterByParticipantId[participantId]!.damage;
          atEarlyStatsByRole[minute][teamIdByParticipantId[participantId]!][
            role
          ]!.wardsPlaced =
            statCounterByParticipantId[participantId]!.wardsPlaced;
        }
      }
      // Add to teamGoldList
      teamGoldList.push({
        leagueGameId,
        teamId: blueTeamUuid,
        minute,
        side: 'Blue',
        gold: computeTeamGoldAtTimestamp(minute * 60, 100),
      });
      teamGoldList.push({
        leagueGameId,
        teamId: redTeamUuid,
        minute,
        side: 'Red',
        gold: computeTeamGoldAtTimestamp(minute * 60, 200),
      });
    });

    /** Calculates the per minute stat based on gameDuration */
    const calculatePerMinute = (stat?: number | null): number => {
      if (!stat) return 0;
      return parseFloat((stat / (info.gameDuration / 60)).toFixed(2));
    };
    /** Initializes the role stat counter for a team. */
    const initRoleStatCounterInTeam = (): Record<LeagueRole, number> => ({
      Top: 0,
      Jungle: 0,
      Middle: 0,
      Bottom: 0,
      Support: 0,
      Unknown: 0,
    });
    /** Used to determine dpmDiff for each player. */
    const damagePerMinuteDealtByRole: Record<
      100 | 200,
      Record<LeagueRole, number>
    > = {
      100: initRoleStatCounterInTeam(),
      200: initRoleStatCounterInTeam(),
    };
    /** Used to determine ward takedown diffs for each player. */
    const wardTakedownsBefore20ByRole: Record<
      100 | 200,
      Record<LeagueRole, number>
    > = {
      100: initRoleStatCounterInTeam(),
      200: initRoleStatCounterInTeam(),
    };
    // Populate above object from MatchV5.ParticipantDTOs
    participants.forEach((player) => {
      const { teamId, totalDamageDealtToChampions, challenges, puuid } = player;
      const role = roleByPuuid[puuid]!;
      damagePerMinuteDealtByRole[teamId as 100 | 200][role]! =
        calculatePerMinute(totalDamageDealtToChampions);
      wardTakedownsBefore20ByRole[teamId as 100 | 200][role]! =
        challenges?.wardTakedownsBefore20M ?? 0;
    });

    /**
     * Creating player stats. Will be used later to insert into
     *  player_stats table.
     */
    const playerStatList: InsertPlayerStat[] = participants.map((player) => {
      const { participantId, puuid, teamId, challenges } = player;
      const role = roleByPuuid[puuid]!;
      const teamId_ = teamId as 100 | 200;
      const opposingTeamId = teamId === 100 ? 200 : 100;
      const totalCs = player.neutralMinionsKilled + player.totalMinionsKilled;
      return {
        leagueGameId,
        participantId,
        riotPuuid: puuid,
        riotIgn: `${player.riotIdGameName}#${player.riotIdTagline}`,
        teamId: teamId_ === 100 ? blueTeamUuid : redTeamUuid,
        playerRole: role,
        side: teamId_ === 100 ? 'Blue' : 'Red',
        champId: player.championId,
        champName: player.championName,
        win: teamId_ === 100 ? blueTeam.win : redTeam.win,
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        damageDealtPerMinute: damagePerMinuteDealtByRole[teamId_][role]!,
        damageDealtPerMinuteDiff:
          damagePerMinuteDealtByRole[teamId_][role]! -
          damagePerMinuteDealtByRole[opposingTeamId][role]!,
        damageTakenPerMinute: calculatePerMinute(player.totalDamageTaken),
        creepScorePerMinute: calculatePerMinute(totalCs),
        goldPerMinute: calculatePerMinute(player.goldEarned),
        visionScorePerMinute: calculatePerMinute(player.visionScore),
        firstBloodKill: player.firstBloodKill,
        firstBloodAssist: player.firstBloodAssist,
        firstBloodVictim: participantId === firstBloodVictimId,
        firstTower: player.firstTowerKill || player.firstTowerAssist,
        soloKills: challenges.soloKills,
        pentaKills: player.pentaKills,
        quadraKills: player.quadraKills - player.pentaKills,
        tripleKills: player.tripleKills - player.quadraKills,
        doubleKills: player.doubleKills - player.tripleKills,
        summoner1Id: player.summoner1Id,
        summoner2Id: player.summoner2Id,
        summoner1Casts: player.summoner1Casts,
        summoner2Casts: player.summoner2Casts,
        spell1Casts: player.spell1Casts,
        spell2Casts: player.spell2Casts,
        spell3Casts: player.spell3Casts,
        spell4Casts: player.spell4Casts,
        champLevel: player.champLevel,
        itemsFinal: [
          player.item0,
          player.item1,
          player.item2,
          player.item3,
          player.item4,
          player.item5,
          player.item6,
        ],
        killsAt10: atEarlyStatsByRole[10][teamId_][role]!.kills,
        killsAt15: atEarlyStatsByRole[15][teamId_][role]!.kills,
        killsAt20: atEarlyStatsByRole[20][teamId_][role]!.kills,
        deathsAt10: atEarlyStatsByRole[10][teamId_][role]!.deaths,
        deathsAt15: atEarlyStatsByRole[15][teamId_][role]!.deaths,
        deathsAt20: atEarlyStatsByRole[20][teamId_][role]!.deaths,
        assistsAt10: atEarlyStatsByRole[10][teamId_][role]!.assists,
        assistsAt15: atEarlyStatsByRole[15][teamId_][role]!.assists,
        assistsAt20: atEarlyStatsByRole[20][teamId_][role]!.assists,
        csAt10: atEarlyStatsByRole[10][teamId_][role]!.cs,
        csAt15: atEarlyStatsByRole[15][teamId_][role]!.cs,
        csAt20: atEarlyStatsByRole[20][teamId_][role]!.cs,
        csDiff10:
          (atEarlyStatsByRole[10][teamId_][role]!.cs ?? 0) -
          (atEarlyStatsByRole[10][opposingTeamId][role]!.cs ?? 0),
        csDiff15:
          (atEarlyStatsByRole[15][teamId_][role]!.cs ?? 0) -
          (atEarlyStatsByRole[15][opposingTeamId][role]!.cs ?? 0),
        csDiff20:
          (atEarlyStatsByRole[20][teamId_][role]!.cs ?? 0) -
          (atEarlyStatsByRole[20][opposingTeamId][role]!.cs ?? 0),
        goldAt10: atEarlyStatsByRole[10][teamId_][role]!.gold,
        goldAt15: atEarlyStatsByRole[15][teamId_][role]!.gold,
        goldAt20: atEarlyStatsByRole[20][teamId_][role]!.gold,
        goldDiff10:
          (atEarlyStatsByRole[10][teamId_][role]!.gold ?? 0) -
          (atEarlyStatsByRole[10][opposingTeamId][role]!.gold ?? 0),
        goldDiff15:
          (atEarlyStatsByRole[15][teamId_][role]!.gold ?? 0) -
          (atEarlyStatsByRole[15][opposingTeamId][role]!.gold ?? 0),
        goldDiff20:
          (atEarlyStatsByRole[20][teamId_][role]!.gold ?? 0) -
          (atEarlyStatsByRole[20][opposingTeamId][role]!.gold ?? 0),
        xpAt10: atEarlyStatsByRole[10][teamId_][role]!.xp,
        xpAt15: atEarlyStatsByRole[15][teamId_][role]!.xp,
        xpAt20: atEarlyStatsByRole[20][teamId_][role]!.xp,
        xpDiff10:
          (atEarlyStatsByRole[10][teamId_][role]!.xp ?? 0) -
          (atEarlyStatsByRole[10][opposingTeamId][role]!.xp ?? 0),
        xpDiff15:
          (atEarlyStatsByRole[15][teamId_][role]!.xp ?? 0) -
          (atEarlyStatsByRole[15][opposingTeamId][role]!.xp ?? 0),
        xpDiff20:
          (atEarlyStatsByRole[20][teamId_][role]!.xp ?? 0) -
          (atEarlyStatsByRole[20][opposingTeamId][role]!.xp ?? 0),
        damageAt10: atEarlyStatsByRole[10][teamId_][role]!.damage,
        damageAt15: atEarlyStatsByRole[15][teamId_][role]!.damage,
        damageAt20: atEarlyStatsByRole[20][teamId_][role]!.damage,
        damageDiff10:
          (atEarlyStatsByRole[10][teamId_][role]!.damage ?? 0) -
          (atEarlyStatsByRole[10][opposingTeamId][role]!.damage ?? 0),
        damageDiff15:
          (atEarlyStatsByRole[15][teamId_][role]!.damage ?? 0) -
          (atEarlyStatsByRole[15][opposingTeamId][role]!.damage ?? 0),
        damageDiff20:
          (atEarlyStatsByRole[20][teamId_][role]!.damage ?? 0) -
          (atEarlyStatsByRole[20][opposingTeamId][role]!.damage ?? 0),
        wardsPlacedAt10: atEarlyStatsByRole[10][teamId_][role]!.wardsPlaced,
        wardsPlacedAt15: atEarlyStatsByRole[15][teamId_][role]!.wardsPlaced,
        wardsPlacedAt20: atEarlyStatsByRole[20][teamId_][role]!.wardsPlaced,
        wardsPlacedDiff10:
          (atEarlyStatsByRole[10][teamId_][role]!.wardsPlaced ?? 0) -
          (atEarlyStatsByRole[10][opposingTeamId][role]!.wardsPlaced ?? 0),
        wardsPlacedDiff15:
          (atEarlyStatsByRole[15][teamId_][role]!.wardsPlaced ?? 0) -
          (atEarlyStatsByRole[15][opposingTeamId][role]!.wardsPlaced ?? 0),
        wardsPlacedDiff20:
          (atEarlyStatsByRole[20][teamId_][role]!.wardsPlaced ?? 0) -
          (atEarlyStatsByRole[20][opposingTeamId][role]!.wardsPlaced ?? 0),
        wardTakedownsBefore20: challenges.wardTakedownsBefore20M,
        wardTakedownsDiff20:
          wardTakedownsBefore20ByRole[teamId_][role]! -
          wardTakedownsBefore20ByRole[opposingTeamId][role]!,
        totalDamageToChamps: player.totalDamageDealtToChampions,
        physicalDamageDealtToChamps: player.physicalDamageDealtToChampions,
        magicDamageDealtToChamps: player.magicDamageDealtToChampions,
        trueDamageDealtToChamps: player.trueDamageDealtToChampions,
        damageToTurrets: player.damageDealtToTurrets,
        damageToObjectives: player.damageDealtToObjectives,
        totalDamageTaken: player.totalDamageTaken,
        totalHeals: player.totalHealsOnTeammates,
        totalTimeCrowdControlDealt: player.timeCCingOthers,
        totalTimeSpentDead: player.totalTimeSpentDead,
        gold: player.goldEarned,
        creepScore: totalCs,
        visionScore: player.visionScore,
        wardsPlaced: player.wardsPlaced,
        controlWardsPlaced: challenges.controlWardsPlaced,
        wardTakedowns: challenges.wardTakedowns,
        pingsAllIn: player.allInPings,
        pingsAssistMe: player.assistMePings,
        pingsCaution: player.getBackPings,
        pingsCommand: player.commandPings,
        pingsEnemyMissing: player.enemyMissingPings,
        pingsEnemyVision: player.enemyVisionPings,
        pingsNeedVision: player.needVisionPings,
        pingsOnMyWay: player.onMyWayPings,
        pingsPush: player.pushPings,
        pingsRetreat: player.retreatPings,
      };
    });

    /** Computes the team stat based on the specific player stat. */
    const computeTotalTeamStat = (
      teamId: 100 | 200,
      stat: keyof InsertPlayerStat,
    ): number | null => {
      const teamPlayers = playerStatList.filter(
        (p) => p.side === (teamId === 100 ? 'Blue' : 'Red'),
      );
      if (typeof teamPlayers[0]![stat] !== 'number') {
        return null;
      }
      return teamPlayers.reduce(
        (total, player) => total + ((player[stat] as number) ?? 0),
        0,
      );
    };
    /**
     * Creating team stats. Will be used later to insert into
     *  team_stats table.
     */
    const teamStatsList: InsertTeamStat[] = [blueTeam, redTeam].map((team) => {
      const { teamId, objectives } = team;
      const teamId_ = teamId as 100 | 200;
      const opposingTeamId = teamId === 100 ? 200 : 100;
      const totalKills = computeTotalTeamStat(teamId_, 'kills');
      const totalDeaths = computeTotalTeamStat(teamId_, 'deaths');
      const totalAssists = computeTotalTeamStat(teamId_, 'assists');
      const totalDamageDealt = computeTotalTeamStat(
        teamId_,
        'totalDamageToChamps',
      );
      const totalGold = computeTotalTeamStat(teamId_, 'gold');
      const totalCreepScore = computeTotalTeamStat(teamId_, 'creepScore');
      const totalVisionScore = computeTotalTeamStat(teamId_, 'visionScore');
      const wardsClearedAt10 = Object.values(
        atEarlyStatsByRole[10][teamId_],
      ).reduce((total, stats) => total + (stats?.wardsCleared ?? 0), 0);
      const opposingWardsClearedAt10 = Object.values(
        atEarlyStatsByRole[10][opposingTeamId],
      ).reduce((total, stats) => total + (stats?.wardsCleared ?? 0), 0);
      const wardsClearedAt15 = Object.values(
        atEarlyStatsByRole[15][teamId_],
      ).reduce((total, stats) => total + (stats?.wardsCleared ?? 0), 0);
      const opposingWardsClearedAt15 = Object.values(
        atEarlyStatsByRole[15][opposingTeamId],
      ).reduce((total, stats) => total + (stats?.wardsCleared ?? 0), 0);
      const wardsClearedAt20 = Object.values(
        atEarlyStatsByRole[20][teamId_],
      ).reduce((total, stats) => total + (stats?.wardsCleared ?? 0), 0);
      const opposingWardsClearedAt20 = Object.values(
        atEarlyStatsByRole[20][opposingTeamId],
      ).reduce((total, stats) => total + (stats?.wardsCleared ?? 0), 0);
      return {
        leagueGameId,
        teamId: teamId === 100 ? blueTeamUuid : redTeamUuid,
        side: teamId === 100 ? 'Blue' : 'Red',
        win: teamId === 100 ? blueTeam.win : redTeam.win,
        totalKills,
        totalDeaths,
        totalAssists,
        totalDamageDealt,
        totalGold,
        totalCreepScore,
        totalVisionScore,
        totalWardsPlaced: computeTotalTeamStat(teamId_, 'wardsPlaced'),
        totalControlWardsPlaced: computeTotalTeamStat(
          teamId_,
          'controlWardsPlaced',
        ),
        totalWardTakedowns: computeTotalTeamStat(teamId_, 'wardTakedowns'),
        totalTowers: objectives.tower.kills,
        totalInhibitors: objectives.inhibitor.kills,
        totalDragons: objectives.dragon.kills,
        totalVoidgrubs: objectives.horde.kills,
        totalHeralds: objectives.riftHerald.kills,
        totalAtakhans: objectives.atakhan.kills,
        totalBarons: objectives.baron.kills,
        damageDealtPerMinute: calculatePerMinute(totalDamageDealt),
        goldPerMinute: calculatePerMinute(totalGold),
        creepScorePerMinute: calculatePerMinute(totalCreepScore),
        visionScorePerMinute: calculatePerMinute(totalVisionScore),
        firstBlood: objectives.champion.first,
        firstTower: objectives.tower.first,
        firstInhibitor: objectives.inhibitor.first,
        firstDragon: objectives.dragon.first,
        firstVoidgrub: objectives.horde.first,
        firstHerald: objectives.riftHerald.first,
        firstAtakhan: objectives.atakhan.first,
        firstBaron: objectives.baron.first,
        goldAt10: computeTotalTeamStat(teamId_, 'goldAt10'),
        goldAt15: computeTotalTeamStat(teamId_, 'goldAt15'),
        goldAt20: computeTotalTeamStat(teamId_, 'goldAt20'),
        goldDiff10: computeTotalTeamStat(teamId_, 'goldDiff10'),
        goldDiff15: computeTotalTeamStat(teamId_, 'goldDiff15'),
        goldDiff20: computeTotalTeamStat(teamId_, 'goldDiff20'),
        csAt10: computeTotalTeamStat(teamId_, 'csAt10'),
        csAt15: computeTotalTeamStat(teamId_, 'csAt15'),
        csAt20: computeTotalTeamStat(teamId_, 'csAt20'),
        csDiff10: computeTotalTeamStat(teamId_, 'csDiff10'),
        csDiff15: computeTotalTeamStat(teamId_, 'csDiff15'),
        csDiff20: computeTotalTeamStat(teamId_, 'csDiff20'),
        xpAt10: computeTotalTeamStat(teamId_, 'xpAt10'),
        xpAt15: computeTotalTeamStat(teamId_, 'xpAt15'),
        xpAt20: computeTotalTeamStat(teamId_, 'xpAt20'),
        xpDiff10: computeTotalTeamStat(teamId_, 'xpDiff10'),
        xpDiff15: computeTotalTeamStat(teamId_, 'xpDiff15'),
        xpDiff20: computeTotalTeamStat(teamId_, 'xpDiff20'),
        killsAt10: computeTotalTeamStat(teamId_, 'killsAt10'),
        killsAt15: computeTotalTeamStat(teamId_, 'killsAt15'),
        killsAt20: computeTotalTeamStat(teamId_, 'killsAt20'),
        killsDiff10:
          computeTotalTeamStat(teamId_, 'killsAt10')! -
          computeTotalTeamStat(opposingTeamId, 'killsAt10')!,
        killsDiff15:
          computeTotalTeamStat(teamId_, 'killsAt15')! -
          computeTotalTeamStat(opposingTeamId, 'killsAt15')!,
        killsDiff20:
          computeTotalTeamStat(teamId_, 'killsAt20')! -
          computeTotalTeamStat(opposingTeamId, 'killsAt20')!,
        deathsAt10: computeTotalTeamStat(teamId_, 'deathsAt10'),
        deathsAt15: computeTotalTeamStat(teamId_, 'deathsAt15'),
        deathsAt20: computeTotalTeamStat(teamId_, 'deathsAt20'),
        damageAt10: computeTotalTeamStat(teamId_, 'damageAt10'),
        damageAt15: computeTotalTeamStat(teamId_, 'damageAt15'),
        damageAt20: computeTotalTeamStat(teamId_, 'damageAt20'),
        damageDiff10: computeTotalTeamStat(teamId_, 'damageDiff10'),
        damageDiff15: computeTotalTeamStat(teamId_, 'damageDiff15'),
        damageDiff20: computeTotalTeamStat(teamId_, 'damageDiff20'),
        wardsPlacedAt10: computeTotalTeamStat(teamId_, 'wardsPlacedAt10'),
        wardsPlacedAt15: computeTotalTeamStat(teamId_, 'wardsPlacedAt15'),
        wardsPlacedAt20: computeTotalTeamStat(teamId_, 'wardsPlacedAt20'),
        wardsPlacedDiff10: computeTotalTeamStat(teamId_, 'wardsPlacedDiff10'),
        wardsPlacedDiff15: computeTotalTeamStat(teamId_, 'wardsPlacedDiff15'),
        wardsPlacedDiff20: computeTotalTeamStat(teamId_, 'wardsPlacedDiff20'),
        wardsClearedAt10,
        wardsClearedAt15,
        wardsClearedAt20,
        wardsClearedDiff10: wardsClearedAt10 - opposingWardsClearedAt10,
        wardsClearedDiff15: wardsClearedAt15 - opposingWardsClearedAt15,
        wardsClearedDiff20: wardsClearedAt20 - opposingWardsClearedAt20,
      };
    });

    // Insert into riot_accounts table if puuid does not exist.
    for (const player of participants) {
      const { puuid, riotIdGameName, riotIdTagline } = player;
      const existingAccount = await RiotAccountsQuery.selectByPuuid(puuid);
      if (!existingAccount) {
        await RiotAccountsQuery.insert({
          riotPuuid: puuid!,
          mainAccount: true,
          gameName: riotIdGameName!,
          tagLine: riotIdTagline,
        });
      }
    }
    /**
     * Adds a banned_champ entity based on the given team data from the riot api.
     */
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
    // Insert into banned_champs table
    const bannedChampsData = await addBannedChamps(
      blueTeam,
      'Blue',
      blueTeamUuid,
      redTeamUuid,
    );
    bannedChampsData.push(
      ...(await addBannedChamps(redTeam, 'Red', redTeamUuid, blueTeamUuid)),
    );

    // Insert into player_stats table
    const getPlayerStats = await Promise.all(
      playerStatList.map((ps) => PlayerStatsQuery.insert(ps)),
    );
    const playerStatsData: PlayerStatDto[] = await Promise.all(
      removeBaseFields(getPlayerStats).map(async (ps) => {
        return {
          ...ps,
          username: await UsersQuery.selectByPuuid(ps.riotPuuid).then(
            (u) => u?.username || null,
          ),
        };
      }),
    );

    // Insert into team_stats table
    const getTeamStats = await Promise.all(
      teamStatsList.map((ts) => TeamStatsQuery.insert(ts)),
    );
    const teamStatsData: TeamStatDto[] = await Promise.all(
      removeBaseFields(getTeamStats).map(async (ts) => {
        return {
          ...ts,
          teamName: await TeamsQuery.selectById(ts.teamId).then(
            (t) => t?.name || null,
          ),
        };
      }),
    );

    // Insert into game_events table
    const gameEventsData = await Promise.all(
      gameEventList.map((event) => GameEventsQuery.insert(event)),
    );

    // Insert into game_team_golds table
    const teamGoldTimelineData = await Promise.all(
      teamGoldList.map((tg) => GameTeamGoldsQuery.insert(tg)),
    );

    // Insert into game_store_actions table
    const storeActionsData = await Promise.all(
      storeActionList.map((sa) => GameStoreActionsQuery.insert(sa)),
    );

    // Insert into game_skill_level_ups table
    const skillLevelUpsData = await Promise.all(
      skillLevelUpList.map((slu) => GameSkillLevelUpsQuery.insert(slu)),
    );

    return {
      game: gameData,
      bannedChamps: removeBaseFields(bannedChampsData),
      playerStats: playerStatsData,
      teamStats: teamStatsData,
      gameEvents: removeBaseFields(gameEventsData),
      teamGoldTimeline: removeBaseFields(teamGoldTimelineData),
      storeActions: removeBaseFields(storeActionsData),
      skillLevelUps: skillLevelUpsData,
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
    const getBannedChamps = await BannedChampsQuery.listByGameId(gameId);
    const getTeamStats = await TeamStatsQuery.listByGameId(gameId);
    const getPlayerStats = await PlayerStatsQuery.listByGameId(gameId);
    const getGameEvents = await GameEventsQuery.listByGameId(gameId);
    const getTeamGoldTimeline = await GameTeamGoldsQuery.listByGameId(gameId);
    const getStoreActions = await GameStoreActionsQuery.listByGameId(gameId);
    const getSkillLevelUps = await GameSkillLevelUpsQuery.listByGameId(gameId);

    return {
      game: getGame,
      bannedChamps: removeBaseFields(getBannedChamps),
      teamStats: removeBaseFields(getTeamStats),
      playerStats: removeBaseFields(getPlayerStats),
      gameEvents: removeBaseFields(getGameEvents),
      teamGoldTimeline: removeBaseFields(getTeamGoldTimeline),
      storeActions: removeBaseFields(getStoreActions),
      skillLevelUps: removeBaseFields(getSkillLevelUps),
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
