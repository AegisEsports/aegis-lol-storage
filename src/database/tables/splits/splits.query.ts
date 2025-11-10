import type { Kysely } from 'kysely';

import { SPLITS } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  type InsertSplit,
  type SplitRow,
  type UpdateSplit,
} from '@/database/schema.js';

export class SplitsQuery {
  // -- INSERT

  static insert(db: Kysely<Database>, values: InsertSplit): Promise<SplitRow> {
    return db
      .insertInto(SPLITS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: Kysely<Database>,
    id: string,
  ): Promise<SplitRow | undefined> {
    return db
      .selectFrom(SPLITS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByLeagueId(
    db: Kysely<Database>,
    leagueId: string,
  ): Promise<SplitRow[]> {
    return db
      .selectFrom(SPLITS)
      .selectAll()
      .where('leagueId', '=', leagueId)
      .execute();
  }

  // -- UPDATE

  static updateById(
    db: Kysely<Database>,
    id: string,
    update: UpdateSplit,
  ): Promise<SplitRow | undefined> {
    return db
      .updateTable(SPLITS)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(
    db: Kysely<Database>,
    id: string,
  ): Promise<SplitRow | undefined> {
    return db
      .deleteFrom(SPLITS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
