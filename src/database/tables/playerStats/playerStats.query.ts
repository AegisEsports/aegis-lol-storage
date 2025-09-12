import { PLAYER_STATS } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertPlayerStat,
  type PlayerStatRow,
} from '@/database/schema.js';

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

  // -- UPDATE (not updateable)

  // -- DELETE

  static deleteById(id: string): Promise<PlayerStatRow | undefined> {
    return db
      .deleteFrom(PLAYER_STATS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
