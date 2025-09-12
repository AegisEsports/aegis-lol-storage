import { GAME_EVENTS } from '@/database/const.js';
import { db } from '@/database/database.js';
import { type InsertGameEvent, type GameEventRow } from '@/database/schema.js';

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

  // -- UPDATE (Not updateable)

  // -- DELETE

  static deleteById(id: string): Promise<GameEventRow | undefined> {
    return db
      .deleteFrom(GAME_EVENTS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
