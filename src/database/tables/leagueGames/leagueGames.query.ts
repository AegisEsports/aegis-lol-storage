import {
  EMERGENCY_SUB_REQUESTS,
  LEAGUE_GAMES,
  PLAYER_STATS,
  RIOT_ACCOUNTS,
} from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertLeagueGame,
  type LeagueGameRow,
  type UpdateLeagueGame,
} from '@/database/schema.js';
import type { GamesPlayedInDto } from '@/router/user/v1/user.dto.js';

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
