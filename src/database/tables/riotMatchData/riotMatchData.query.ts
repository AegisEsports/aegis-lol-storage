import { RIOT_MATCH_DATA } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertRiotMatchData,
  type RiotMatchDataRow,
} from '@/database/schema.js';

export class RiotMatchDataQuery {
  // -- INSERT

  static insert(values: InsertRiotMatchData): Promise<RiotMatchDataRow> {
    return db
      .insertInto(RIOT_MATCH_DATA)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<RiotMatchDataRow | undefined> {
    return db
      .selectFrom(RIOT_MATCH_DATA)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE (not updateable)

  // -- DELETE

  static deleteById(id: string): Promise<RiotMatchDataRow | undefined> {
    return db
      .deleteFrom(RIOT_MATCH_DATA)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
