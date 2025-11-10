import type { Kysely } from 'kysely';

import { ROSTER_REQUESTS, TEAMS } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  type InsertRosterRequest,
  type RosterRequestRow,
  type UpdateRosterRequest,
} from '@/database/schema.js';

export class RosterRequestsQuery {
  // -- INSERT

  static insert(
    db: Kysely<Database>,
    values: InsertRosterRequest,
  ): Promise<RosterRequestRow> {
    return db
      .insertInto(ROSTER_REQUESTS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: Kysely<Database>,
    id: string,
  ): Promise<RosterRequestRow | undefined> {
    return db
      .selectFrom(ROSTER_REQUESTS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listBySplitId(
    db: Kysely<Database>,
    splitId: string,
  ): Promise<RosterRequestRow[]> {
    return db
      .selectFrom(`${ROSTER_REQUESTS} as rr`)
      .innerJoin(`${TEAMS} as t`, 't.id', 'rr.teamId')
      .where('t.splitId', '=', splitId)
      .selectAll('rr')
      .orderBy('rr.createdAt', 'desc')
      .execute();
  }

  static listByTeamId(
    db: Kysely<Database>,
    teamId: string,
  ): Promise<RosterRequestRow[]> {
    return db
      .selectFrom(ROSTER_REQUESTS)
      .selectAll()
      .where('teamId', '=', teamId)
      .execute();
  }

  // -- UPDATE

  static updateById(
    db: Kysely<Database>,
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
    db: Kysely<Database>,
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

  static deleteById(
    db: Kysely<Database>,
    id: string,
  ): Promise<RosterRequestRow | undefined> {
    return db
      .deleteFrom(ROSTER_REQUESTS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
