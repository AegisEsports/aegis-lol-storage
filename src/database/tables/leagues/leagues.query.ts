import { LEAGUES } from '@/database/const.js';
import {
  type InsertLeague,
  type LeagueRow,
  type UpdateLeague,
} from '@/database/schema.js';
import type { DbType } from '@/database/types.js';

export class LeaguesQuery {
  // -- INSERT

  static insert(db: DbType, values: InsertLeague): Promise<LeagueRow> {
    return db
      .insertInto(LEAGUES)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(db: DbType, id: string): Promise<LeagueRow | undefined> {
    return db
      .selectFrom(LEAGUES)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE

  static updateById(
    db: DbType,
    id: string,
    update: UpdateLeague,
  ): Promise<LeagueRow | undefined> {
    return db
      .updateTable(LEAGUES)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(db: DbType, id: string): Promise<LeagueRow | undefined> {
    return db
      .deleteFrom(LEAGUES)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
