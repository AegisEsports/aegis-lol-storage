import { sql } from 'kysely';

import {
  LEAGUE_GAMES,
  LEAGUE_MATCHES,
  PLAYER_STATS,
  RIOT_ACCOUNTS,
  TEAMS,
  USERS,
} from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertPlayerStat,
  type PlayerStatRow,
} from '@/database/schema.js';
import { RECORD_LIMIT, type LeagueSide } from '@/database/shared.js';
import type { GamePlayerStatRow } from '@/router/game/v1/game.dto.js';
import type {
  PlayerStatOverallDto,
  PlayerStatRecordCreepScorePerMinuteDto,
  PlayerStatRecordCsAt15Dto,
  PlayerStatRecordDamageAt15Dto,
  PlayerStatRecordDamageDealtPerMinuteDto,
  PlayerStatRecordGoldAt15Dto,
  PlayerStatRecordKillsAt15Dto,
  PlayerStatRecordVisionScorePerMinuteDto,
} from '@/router/split/v1/split.dto.js';

/**
 * Helper function to build the base query for player stat records (used in multiple places).
 */
const playerStatRecordBaseQuery = (splitId: string) => {
  return db
    .selectFrom(`${PLAYER_STATS} as ps`)
    .innerJoin(`${LEAGUE_GAMES} as g`, 'g.id', 'ps.leagueGameId')
    .innerJoin(`${LEAGUE_MATCHES} as m`, 'm.id', 'g.leagueMatchId')
    .leftJoin(`${RIOT_ACCOUNTS} as ra`, 'ra.riotPuuid', 'ps.riotPuuid')
    .leftJoin(`${USERS} as u`, 'u.id', 'ra.userId')
    .leftJoin(`${TEAMS} as tb`, 'tb.id', 'g.blueTeamId')
    .leftJoin(`${TEAMS} as tr`, 'tr.id', 'g.redTeamId')
    .where('m.splitId', '=', splitId)
    .where((eb) => eb('g.invalidated', '=', eb.val(false)))
    .select((eb) => [
      'ps.leagueGameId',
      'u.username',
      'ps.riotPuuid',
      'ps.riotIgn',
      'ps.playerRole as role',
      'ps.champId',
      'ps.champName',
      // team/opponent by side
      sql<string | null>`
          CASE WHEN ${eb.ref('ps.side')} = 'Blue' THEN ${eb.ref('tb.name')} ELSE ${eb.ref('tr.name')} END
        `.as('teamName'),
      sql<string | null>`
          CASE WHEN ${eb.ref('ps.side')} = 'Blue' THEN ${eb.ref('tr.name')} ELSE ${eb.ref('tb.name')} END
        `.as('opposingTeamName'),
    ]);
};

export class PlayerStatsQuery {
  // -- INSERT

  static insert(values: InsertPlayerStat): Promise<PlayerStatRow> {
    return db
      .insertInto(PLAYER_STATS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<PlayerStatRow | undefined> {
    return db
      .selectFrom(PLAYER_STATS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByGameId(gameId: string): Promise<GamePlayerStatRow[]> {
    return db
      .selectFrom(`${PLAYER_STATS} as ps`)
      .innerJoin(`${RIOT_ACCOUNTS} as ra`, 'ra.riotPuuid', 'ps.riotPuuid')
      .innerJoin(`${USERS} as u`, 'u.id', 'ra.userId')
      .selectAll('ps')
      .select('u.username as username')
      .where('ps.leagueGameId', '=', gameId)
      .execute();
  }

  static listChampIdsByGameAndSide(
    gameId: string,
    side: LeagueSide,
  ): Promise<number[]> {
    return db
      .selectFrom(PLAYER_STATS)
      .select('champId')
      .where('leagueGameId', '=', gameId)
      .where('side', '=', side)
      .execute()
      .then((rows) => rows.map((r) => r.champId));
  }

  static listOverallBySplitId(
    splitId: string,
  ): Promise<PlayerStatOverallDto[]> {
    return db
      .selectFrom(`${PLAYER_STATS} as ps`)
      .innerJoin(`${LEAGUE_GAMES} as g`, 'g.id', 'ps.leagueGameId')
      .innerJoin(`${LEAGUE_MATCHES} as m`, 'm.id', 'g.leagueMatchId')
      .leftJoin(`${RIOT_ACCOUNTS} as ra`, 'ra.riotPuuid', 'ps.riotPuuid')
      .leftJoin(`${USERS} as u`, 'u.id', 'ra.userId')
      .where('m.splitId', '=', splitId)
      .where('g.invalidated', '=', false)
      .where('u.id', 'is not', null) // ensure we group by actual users
      .groupBy(['u.id', 'ps.playerRole'])
      .select((eb) => [
        // identity
        'u.id as userId',
        'u.username as userName',
        'ps.playerRole as role',

        // games played (distinct games)
        sql<number>`count(distinct ${eb.ref('ps.leagueGameId')})`.as(
          'gamesPlayed',
        ),

        // core totals
        eb.fn.sum<number>('ps.kills').as('totalKills'),
        eb.fn.sum<number>('ps.deaths').as('totalDeaths'),
        eb.fn.sum<number>('ps.assists').as('totalAssists'),
        sql<number>`
          sum(case when ${eb.ref('ps.firstBloodKill')} or ${eb.ref('ps.firstBloodAssist')} then 1 else 0 end)
        `.as('totalFirstBloodTakedowns'),
        eb.fn.sum<number>('ps.soloKills').as('totalSoloKills'),
        eb.fn.sum<number>('ps.doubleKills').as('totalDoubleKills'),
        eb.fn.sum<number>('ps.tripleKills').as('totalTripleKills'),
        eb.fn.sum<number>('ps.quadraKills').as('totalQuadraKills'),
        eb.fn.sum<number>('ps.pentaKills').as('totalPentaKills'),

        // averages (simple mean of per-game values)
        eb.fn.avg<number>('ps.totalDamageToChamps').as('averageDamageToChamps'),
        sql<number>`stddev_samp(${eb.ref('ps.totalDamageToChamps')})`.as(
          'standardDeviationDamageToChamps',
        ),
        eb.fn
          .avg<number>('ps.damageDealtPerMinute')
          .as('averageDamageToChampsPerMinute'),
        eb.fn.avg<number>('ps.goldPerMinute').as('averageGoldPerMinute'),
        eb.fn
          .avg<number>('ps.creepScorePerMinute')
          .as('averageCreepScorePerMinute'),
        eb.fn
          .avg<number>('ps.visionScorePerMinute')
          .as('averageVisionScorePerMinute'),

        // normalize wards per minute by game duration, then average
        sql<number>`avg( ( ${eb.ref('ps.wardsPlaced')}::float * 60.0 ) / nullif(${eb.ref('g.duration')}, 0) )`.as(
          'averageWardsPlacedPerMinute',
        ),
        sql<number>`avg( ( ${eb.ref('ps.wardTakedowns')}::float * 60.0 ) / nullif(${eb.ref('g.duration')}, 0) )`.as(
          'averageWardTakedownsPerMinute',
        ),

        // timeline averages
        eb.fn.avg<number>('ps.killsAt10').as('averageKillsAt10'),
        eb.fn.avg<number>('ps.killsAt15').as('averageKillsAt15'),
        eb.fn.avg<number>('ps.killsAt20').as('averageKillsAt20'),

        eb.fn.avg<number>('ps.csAt10').as('averageCsAt10'),
        eb.fn.avg<number>('ps.csAt15').as('averageCsAt15'),
        eb.fn.avg<number>('ps.csAt20').as('averageCsAt20'),

        eb.fn.avg<number>('ps.goldAt10').as('averageGoldAt10'),
        eb.fn.avg<number>('ps.goldAt15').as('averageGoldAt15'),
        eb.fn.avg<number>('ps.goldAt20').as('averageGoldAt20'),

        eb.fn.avg<number>('ps.xpAt10').as('averageXpAt10'),
        eb.fn.avg<number>('ps.xpAt15').as('averageXpAt15'),
        eb.fn.avg<number>('ps.xpAt20').as('averageXpAt20'),

        eb.fn.avg<number>('ps.damageAt10').as('averageDamageAt10'),
        eb.fn.avg<number>('ps.damageAt15').as('averageDamageAt15'),
        eb.fn.avg<number>('ps.damageAt20').as('averageDamageAt20'),

        eb.fn.avg<number>('ps.wardsPlacedAt20').as('averageWardsPlacedAt20'),
        eb.fn
          .avg<number>('ps.wardTakedownsBefore20')
          .as('averageWardTakedownsBefore20'),

        // diff averages
        eb.fn
          .avg<number>('ps.damageDealtPerMinuteDiff')
          .as('averageDamageDealtPerMinuteDiff'),

        eb.fn.avg<number>('ps.csDiff10').as('averageCsDiff10'),
        eb.fn.avg<number>('ps.csDiff15').as('averageCsDiff15'),
        eb.fn.avg<number>('ps.csDiff20').as('averageCsDiff20'),

        eb.fn.avg<number>('ps.goldDiff10').as('averageGoldDiff10'),
        eb.fn.avg<number>('ps.goldDiff15').as('averageGoldDiff15'),
        eb.fn.avg<number>('ps.goldDiff20').as('averageGoldDiff20'),

        eb.fn.avg<number>('ps.xpDiff10').as('averageXpDiff10'),
        eb.fn.avg<number>('ps.xpDiff15').as('averageXpDiff15'),
        eb.fn.avg<number>('ps.xpDiff20').as('averageXpDiff20'),

        eb.fn.avg<number>('ps.damageDiff10').as('averageDamageDiff10'),
        eb.fn.avg<number>('ps.damageDiff15').as('averageDamageDiff15'),
        eb.fn.avg<number>('ps.damageDiff20').as('averageDamageDiff20'),

        eb.fn.avg<number>('ps.wardsPlacedDiff20').as('averageWardsDiff20'),
        eb.fn
          .avg<number>('ps.wardTakedownsDiff20')
          .as('averageWardTakedownDiff20'),
      ])
      .orderBy('u.username', 'asc')
      .execute();
  }

  // For PlayerStatRecord
  static listCreepScorePerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordCreepScorePerMinuteDto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select(['ps.creepScorePerMinute', 'ps.creepScore'])
      .orderBy('ps.creepScorePerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listDamageDealtPerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordDamageDealtPerMinuteDto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select([
        'ps.damageDealtPerMinute',
        'ps.totalDamageToChamps as damageDealt',
      ])
      .orderBy('ps.damageDealtPerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listVisionScorePerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordVisionScorePerMinuteDto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select(['ps.visionScorePerMinute', 'ps.visionScore'])
      .orderBy('ps.visionScorePerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listKillsAt15RecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordKillsAt15Dto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select('ps.killsAt15')
      .orderBy('ps.killsAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listDamageAt15RecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordDamageAt15Dto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select(['ps.damageAt15', 'ps.damageDiff15'])
      .orderBy('ps.damageAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listGoldAt15RecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordGoldAt15Dto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select(['ps.goldAt15', 'ps.goldDiff15'])
      .orderBy('ps.goldAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listCsAt15RecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordCsAt15Dto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select(['ps.csAt15', 'ps.csDiff15'])
      .orderBy('ps.csAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  // -- UPDATE (not updateable)

  static setTeamId(gameId: string, side: LeagueSide, teamId: string) {
    return db
      .updateTable(PLAYER_STATS)
      .where('leagueGameId', '=', gameId)
      .where('side', '=', side)
      .set({ teamId })
      .executeTakeFirstOrThrow();
  }

  // -- DELETE

  static deleteById(id: string): Promise<PlayerStatRow | undefined> {
    return db
      .deleteFrom(PLAYER_STATS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
