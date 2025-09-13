import { LEAGUE_BANS } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertLeagueBan,
  type LeagueBanRow,
  type UpdateLeagueBan,
} from '@/database/schema.js';

export class LeagueBansQuery {
  // -- INSERT

  static insert(values: InsertLeagueBan): Promise<LeagueBanRow> {
    return db
      .insertInto(LEAGUE_BANS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<LeagueBanRow | undefined> {
    return db
      .selectFrom(LEAGUE_BANS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByUserId(userId: string): Promise<LeagueBanRow[]> {
    return db
      .selectFrom(LEAGUE_BANS)
      .selectAll()
      .where('userIdBanned', '=', userId)
      .execute();
  }

  // -- UPDATE

  static updateById(
    id: string,
    update: UpdateLeagueBan,
  ): Promise<LeagueBanRow | undefined> {
    return db
      .updateTable(LEAGUE_BANS)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(id: string): Promise<LeagueBanRow | undefined> {
    return db
      .deleteFrom(LEAGUE_BANS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
