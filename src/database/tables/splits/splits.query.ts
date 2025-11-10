import { SPLITS } from '@/database/const.js';
import {
  type InsertSplit,
  type SplitRow,
  type UpdateSplit,
} from '@/database/schema.js';
import type { DbType } from '@/database/types.js';

export class SplitsQuery {
  // -- INSERT

  static insert(db: DbType, values: InsertSplit): Promise<SplitRow> {
    return db
      .insertInto(SPLITS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(db: DbType, id: string): Promise<SplitRow | undefined> {
    return db
      .selectFrom(SPLITS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByLeagueId(db: DbType, leagueId: string): Promise<SplitRow[]> {
    return db
      .selectFrom(SPLITS)
      .selectAll()
      .where('leagueId', '=', leagueId)
      .execute();
  }

  // -- UPDATE

  static updateById(
    db: DbType,
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

  static deleteById(db: DbType, id: string): Promise<SplitRow | undefined> {
    return db
      .deleteFrom(SPLITS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
