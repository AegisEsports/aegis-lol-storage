import { sql } from 'kysely';

import {
  EMERGENCY_SUB_REQUESTS,
  GAME_EVENTS,
  LEAGUE_GAMES,
  LEAGUE_MATCHES,
  PLAYER_STATS,
  RIOT_ACCOUNTS,
  TEAM_STATS,
  TEAMS,
} from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertLeagueGame,
  type LeagueGameRow,
  type TeamStatFields,
  type UpdateLeagueGame,
} from '@/database/schema.js';
import { RECORD_LIMIT } from '@/database/shared.js';
import type {
  DragonStatsDto,
  GameStatRecordCreepScorePerMinuteDto,
  GameStatRecordDamagePerMinuteDto,
  GameStatRecordGoldPerMinuteDto,
  GameStatRecordTotalKillsAt15Dto,
  GameStatRecordTotalKillsDto,
  GameStatRecordVisionScorePerMinuteDto,
  SidesStatsDto,
} from '@/router/split/v1/split.dto.js';
import type { GamesPlayedInDto } from '@/router/user/v1/user.dto.js';

/**
 * Helper type to extract only numeric fields from TeamStatFields
 * (used for building dynamic queries)
 */
type NumericTeamStatKey = {
  [K in keyof TeamStatFields]: TeamStatFields[K] extends number | null
    ? K
    : never;
}[keyof TeamStatFields];
/**
 * Helper function to build the base query for team stat records (used in multiple places).
 */
const gameStatsRecordBaseQuery = (
  splitId: string,
  statColumn: NumericTeamStatKey,
) => {
  // Subquery: sum both teams per game
  const tsAgg = db
    .selectFrom(`${TEAM_STATS} as ts`)
    .select((eb) => [
      `ts.leagueGameId as tsLeagueGameId`,
      eb.fn.sum<number>(`ts.${statColumn}`).as(statColumn),
    ])
    .groupBy('tsLeagueGameId')
    .as('t');

  return db
    .selectFrom(`${LEAGUE_GAMES} as g`)
    .innerJoin(`${LEAGUE_MATCHES} as m`, 'm.id', 'g.leagueMatchId')
    .leftJoin(tsAgg, 't.tsLeagueGameId', 'g.id')
    .leftJoin(`${TEAMS} as tb`, 'tb.id', 'g.blueTeamId')
    .leftJoin(`${TEAMS} as tr`, 'tr.id', 'g.redTeamId')
    .where('m.splitId', '=', splitId)
    .where((eb) => eb('g.invalidated', '=', eb.val(false)))
    .select([
      'g.id as leagueGameId',
      'tb.name as blueTeamName',
      'tr.name as redTeamName',
      'g.duration',
      `t.${statColumn} as ${statColumn}`,
    ]);
};

export class LeagueGamesQuery {
  // -- INSERT

  static insert(values: InsertLeagueGame): Promise<LeagueGameRow> {
    return db
      .insertInto(LEAGUE_GAMES)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<LeagueGameRow | undefined> {
    return db
      .selectFrom(LEAGUE_GAMES)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static async listPlayedInByUserId(
    userId: string,
  ): Promise<GamesPlayedInDto[]> {
    // Main query
    return await db
      .selectFrom(`${PLAYER_STATS} as ps`)
      .innerJoin(`${RIOT_ACCOUNTS} as ra`, 'ra.riotPuuid', 'ps.riotPuuid') // puuid belongs to exactly one user
      .innerJoin(`${LEAGUE_GAMES} as g`, 'g.id', 'ps.leagueGameId')
      .where('ra.userId', '=', userId)
      // e-sub (approved) on the same match for this user
      .leftJoin(`${EMERGENCY_SUB_REQUESTS} as es`, (join) =>
        join
          .onRef('es.leagueMatchId', '=', 'g.leagueMatchId')
          .on('es.userId', '=', userId)
          .on('es.approved', '=', true),
      )
      .selectAll('g') // LeagueGameRow fields
      // role & side from stats
      .select(['ps.playerRole as role', 'ps.side as side'])
      // win: did this player’s team win?
      .select((eb) =>
        eb
          .case()
          .when(eb.ref('g.sideWin'), 'is', null)
          .then(null)
          .when(eb.ref('ps.side'), '=', eb.ref('g.sideWin'))
          .then(true)
          .else(false)
          .end()
          .as('win'),
      )
      // eSubbed: approved e-sub row exists for this match & user
      .select((eb) =>
        eb
          .case()
          .when(eb.ref('es.id'), 'is', null)
          .then(false)
          .else(true)
          .end()
          .as('eSubbed'),
      )
      .orderBy('g.startedAt', 'desc')
      .execute();
  }

  static listByMatchId(matchId: string): Promise<LeagueGameRow[]> {
    return db
      .selectFrom(LEAGUE_GAMES)
      .selectAll()
      .where('leagueMatchId', '=', matchId)
      .execute();
  }

  static selectSidesBySplitId(
    splitId: string,
  ): Promise<SidesStatsDto | undefined> {
    return db
      .selectFrom(`${LEAGUE_GAMES} as g`)
      .innerJoin(`${LEAGUE_MATCHES} as m`, 'm.id', 'g.leagueMatchId')
      .where('m.splitId', '=', splitId)
      .select((eb) => [
        sql<number>`count(*) filter (where ${eb.ref('g.sideWin')} = 'Blue')`.as(
          'blueSides',
        ),
        sql<number>`count(*) filter (where ${eb.ref('g.sideWin')} = 'Red')`.as(
          'redSides',
        ),
      ])
      .executeTakeFirst();
  }

  static selectDragonsBySplitId(
    splitId: string,
  ): Promise<DragonStatsDto | undefined> {
    return db
      .selectFrom(`${GAME_EVENTS} as e`)
      .innerJoin(`${LEAGUE_GAMES} as g`, 'g.id', 'e.leagueGameId')
      .innerJoin(`${LEAGUE_MATCHES} as m`, 'm.id', 'g.leagueMatchId')
      .where('m.splitId', '=', splitId)
      .where((eb) => eb('g.invalidated', '=', eb.val(false)))
      .select((eb) => [
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Cloud_Drake')`.as(
          'cloud',
        ),
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Ocean_Drake')`.as(
          'ocean',
        ),
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Infernal_Drake')`.as(
          'infernal',
        ),
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Mountain_Drake')`.as(
          'mountain',
        ),
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Hextech_Drake')`.as(
          'hextech',
        ),
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Chemtech_Drake')`.as(
          'chemtech',
        ),
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Elder_Drake')`.as(
          'elder',
        ),
      ])
      .executeTakeFirst(); // always returns one row with 0s, but keep `undefined` in signature if you prefer
  }

  // For GameStatRecords

  static listTotalKillsRecordsBySplitId(
    splitId: string,
  ): Promise<GameStatRecordTotalKillsDto[]> {
    return gameStatsRecordBaseQuery(splitId, 'totalKills')
      .orderBy('t.totalKills', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listTotalKillsAt15RecordsBySplitId(
    splitId: string,
  ): Promise<GameStatRecordTotalKillsAt15Dto[]> {
    return gameStatsRecordBaseQuery(splitId, 'killsAt15')
      .orderBy('t.killsAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listCreepScorePerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<GameStatRecordCreepScorePerMinuteDto[]> {
    return gameStatsRecordBaseQuery(splitId, 'creepScorePerMinute')
      .orderBy('t.creepScorePerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listGoldPerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<GameStatRecordGoldPerMinuteDto[]> {
    return gameStatsRecordBaseQuery(splitId, 'goldPerMinute')
      .orderBy('t.goldPerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listDamagePerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<GameStatRecordDamagePerMinuteDto[]> {
    return gameStatsRecordBaseQuery(splitId, 'damageDealtPerMinute')
      .orderBy('t.damageDealtPerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listVisionScorePerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<GameStatRecordVisionScorePerMinuteDto[]> {
    return gameStatsRecordBaseQuery(splitId, 'visionScorePerMinute')
      .orderBy('t.visionScorePerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  // -- UPDATE

  static updateById(
    id: string,
    update: UpdateLeagueGame,
  ): Promise<LeagueGameRow | undefined> {
    return db
      .updateTable(LEAGUE_GAMES)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  static setMatchId(
    gameId: string,
    matchId: string,
  ): Promise<LeagueGameRow | undefined> {
    return db
      .updateTable(LEAGUE_GAMES)
      .set({ leagueMatchId: matchId })
      .where('id', '=', gameId)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(id: string): Promise<LeagueGameRow | undefined> {
    return db
      .deleteFrom(LEAGUE_GAMES)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
