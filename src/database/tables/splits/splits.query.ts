import { SPLITS } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertSplit,
  type SplitRow,
  type UpdateSplit,
} from '@/database/schema.js';

export class SplitsQuery {
  // -- INSERT

  static insert(values: InsertSplit): Promise<SplitRow> {
    return db
      .insertInto(SPLITS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<SplitRow | undefined> {
    return db
      .selectFrom(SPLITS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE

  static updateById(
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

  static deleteById(id: string): Promise<SplitRow | undefined> {
    return db
      .deleteFrom(SPLITS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
