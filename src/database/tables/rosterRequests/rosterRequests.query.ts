import { ROSTER_REQUESTS } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertRosterRequest,
  type RosterRequestRow,
  type UpdateRosterRequest,
} from '@/database/schema.js';

export class RosterRequestsQuery {
  // -- INSERT

  static insert(values: InsertRosterRequest): Promise<RosterRequestRow> {
    return db
      .insertInto(ROSTER_REQUESTS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<RosterRequestRow | undefined> {
    return db
      .selectFrom(ROSTER_REQUESTS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE

  static updateById(
    id: string,
    update: UpdateRosterRequest,
  ): Promise<RosterRequestRow | undefined> {
    return db
      .updateTable(ROSTER_REQUESTS)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(id: string): Promise<RosterRequestRow | undefined> {
    return db
      .deleteFrom(ROSTER_REQUESTS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
