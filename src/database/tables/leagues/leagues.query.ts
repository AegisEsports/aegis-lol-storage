import type { Kysely } from 'kysely';

import { LEAGUES } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  type InsertLeague,
  type LeagueRow,
  type UpdateLeague,
} from '@/database/schema.js';

export class LeaguesQuery {
  // -- INSERT

  static insert(
    db: Kysely<Database>,
    values: InsertLeague,
  ): Promise<LeagueRow> {
    return db
      .insertInto(LEAGUES)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: Kysely<Database>,
    id: string,
  ): Promise<LeagueRow | undefined> {
    return db
      .selectFrom(LEAGUES)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE

  static updateById(
    db: Kysely<Database>,
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

  static deleteById(
    db: Kysely<Database>,
    id: string,
  ): Promise<LeagueRow | undefined> {
    return db
      .deleteFrom(LEAGUES)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
