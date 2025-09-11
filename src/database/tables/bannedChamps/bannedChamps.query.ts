import { BANNED_CHAMPS } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertBannedChamp,
  type BannedChampRow,
  type UpdateBannedChamp,
} from '@/database/schema.js';

export class BannedChampsQuery {
  // -- INSERT

  static insert(values: InsertBannedChamp): Promise<BannedChampRow> {
    return db
      .insertInto(BANNED_CHAMPS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<BannedChampRow | undefined> {
    return db
      .selectFrom(BANNED_CHAMPS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE

  static updateById(
    id: string,
    update: UpdateBannedChamp,
  ): Promise<BannedChampRow | undefined> {
    return db
      .updateTable(BANNED_CHAMPS)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(id: string): Promise<BannedChampRow | undefined> {
    return db
      .deleteFrom(BANNED_CHAMPS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
