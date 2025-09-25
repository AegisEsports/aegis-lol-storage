import { ROSTER_REQUESTS, TEAMS } from '@/database/const.js';
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

  static listBySplitId(splitId: string): Promise<RosterRequestRow[]> {
    return db
      .selectFrom(`${ROSTER_REQUESTS} as rr`)
      .innerJoin(`${TEAMS} as t`, 't.id', 'rr.teamId')
      .where('t.splitId', '=', splitId)
      .selectAll('rr')
      .orderBy('rr.createdAt', 'desc')
      .execute();
  }

  static listByTeamId(teamId: string): Promise<RosterRequestRow[]> {
    return db
      .selectFrom(ROSTER_REQUESTS)
      .selectAll()
      .where('teamId', '=', teamId)
      .execute();
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

  static setApproval(
    approved: boolean,
    rosterRequestId: string,
    userReviewedById: string,
  ): Promise<RosterRequestRow | undefined> {
    return db
      .updateTable(ROSTER_REQUESTS)
      .set({
        approved,
        reviewedAt: new Date().toISOString(),
        reviewedById: userReviewedById,
      })
      .where('id', '=', rosterRequestId)
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
