import { LEAGUES } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertLeague,
  type LeagueRow,
  type UpdateLeague,
} from '@/database/schema.js';

export class LeaguesQuery {
  // -- INSERT

  static insert(values: InsertLeague): Promise<LeagueRow> {
    return db
      .insertInto(LEAGUES)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<LeagueRow | undefined> {
    return db
      .selectFrom(LEAGUES)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE

  static updateById(
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

  static deleteById(id: string): Promise<LeagueRow | undefined> {
    return db
      .deleteFrom(LEAGUES)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
