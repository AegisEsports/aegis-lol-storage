import { GAME_EVENTS } from '@/database/const.js';
import { type InsertGameEvent, type GameEventRow } from '@/database/schema.js';
import type { LeagueSide } from '@/database/shared.js';
import type { DbType } from '@/database/types.js';

export class GameEventsQuery {
  // -- INSERT

  static insert(db: DbType, values: InsertGameEvent): Promise<GameEventRow> {
    return db
      .insertInto(GAME_EVENTS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(db: DbType, id: string): Promise<GameEventRow | undefined> {
    return db
      .selectFrom(GAME_EVENTS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByGameId(db: DbType, gameId: string): Promise<GameEventRow[]> {
    return db
      .selectFrom(GAME_EVENTS)
      .selectAll()
      .where('leagueGameId', '=', gameId)
      .orderBy('gameTimestamp', 'asc')
      .execute();
  }

  // -- UPDATE (Not updateable)

  static async setTeamId(
    db: DbType,
    gameId: string,
    side: LeagueSide,
    teamId: string,
  ) {
    await db
      .updateTable(GAME_EVENTS)
      .where('leagueGameId', '=', gameId)
      .where('side', '=', side)
      .set({ teamId })
      .executeTakeFirstOrThrow();
  }

  // -- DELETE

  static deleteById(db: DbType, id: string): Promise<GameEventRow | undefined> {
    return db
      .deleteFrom(GAME_EVENTS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
