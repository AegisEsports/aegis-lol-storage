import { GAME_EVENTS } from '@/database/const.js';
import { db } from '@/database/database.js';
import { type InsertGameEvent, type GameEventRow } from '@/database/schema.js';
import type { LeagueSide } from '@/database/shared.js';

export class GameEventsQuery {
  // -- INSERT

  static insert(values: InsertGameEvent): Promise<GameEventRow> {
    return db
      .insertInto(GAME_EVENTS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<GameEventRow | undefined> {
    return db
      .selectFrom(GAME_EVENTS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByGameId(gameId: string): Promise<GameEventRow[]> {
    return db
      .selectFrom(GAME_EVENTS)
      .selectAll()
      .where('leagueGameId', '=', gameId)
      .orderBy('gameTimestamp', 'asc')
      .execute();
  }

  // -- UPDATE (Not updateable)

  static async setTeamId(gameId: string, side: LeagueSide, teamId: string) {
    await db
      .updateTable(GAME_EVENTS)
      .where('leagueGameId', '=', gameId)
      .where('side', '=', side)
      .set({ teamId })
      .executeTakeFirstOrThrow();
  }

  // -- DELETE

  static deleteById(id: string): Promise<GameEventRow | undefined> {
    return db
      .deleteFrom(GAME_EVENTS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
