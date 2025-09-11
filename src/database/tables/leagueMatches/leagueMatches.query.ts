import { LEAGUE_MATCHES } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertLeagueMatch,
  type LeagueMatchRow,
  type UpdateLeagueMatch,
} from '@/database/schema.js';

export class LeagueMatchesQuery {
  // -- INSERT

  static insert(values: InsertLeagueMatch): Promise<LeagueMatchRow> {
    return db
      .insertInto(LEAGUE_MATCHES)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<LeagueMatchRow | undefined> {
    return db
      .selectFrom(LEAGUE_MATCHES)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE

  static updateById(
    id: string,
    update: UpdateLeagueMatch,
  ): Promise<LeagueMatchRow | undefined> {
    return db
      .updateTable(LEAGUE_MATCHES)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(id: string): Promise<LeagueMatchRow | undefined> {
    return db
      .deleteFrom(LEAGUE_MATCHES)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
