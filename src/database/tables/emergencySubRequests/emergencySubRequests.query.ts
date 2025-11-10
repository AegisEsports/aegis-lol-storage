import { EMERGENCY_SUB_REQUESTS, TEAMS } from '@/database/const.js';
import {
  type InsertEmergencySubRequest,
  type EmergencySubRequestRow,
  type UpdateEmergencySubRequest,
} from '@/database/schema.js';
import type { DbType } from '@/database/types.js';

export class EmergencySubRequestsQuery {
  // -- INSERT

  static insert(
    db: DbType,
    values: InsertEmergencySubRequest,
  ): Promise<EmergencySubRequestRow> {
    return db
      .insertInto(EMERGENCY_SUB_REQUESTS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: DbType,
    id: string,
  ): Promise<EmergencySubRequestRow | undefined> {
    return db
      .selectFrom(EMERGENCY_SUB_REQUESTS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listBySplitId(
    db: DbType,
    splitId: string,
  ): Promise<EmergencySubRequestRow[]> {
    return db
      .selectFrom(`${EMERGENCY_SUB_REQUESTS} as esb`)
      .innerJoin(`${TEAMS} as t`, 't.id', 'esb.teamId')
      .where('t.splitId', '=', splitId)
      .selectAll('esb')
      .orderBy('esb.createdAt', 'desc')
      .execute();
  }

  static listByTeamId(
    db: DbType,
    teamId: string,
  ): Promise<EmergencySubRequestRow[]> {
    return db
      .selectFrom(EMERGENCY_SUB_REQUESTS)
      .selectAll()
      .where('teamId', '=', teamId)
      .execute();
  }

  // -- UPDATE

  static updateById(
    db: DbType,
    id: string,
    update: UpdateEmergencySubRequest,
  ): Promise<EmergencySubRequestRow | undefined> {
    return db
      .updateTable(EMERGENCY_SUB_REQUESTS)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  static setApproval(
    db: DbType,
    approved: boolean,
    emergencySubRequestId: string,
    userReviewedById: string,
  ): Promise<EmergencySubRequestRow | undefined> {
    return db
      .updateTable(EMERGENCY_SUB_REQUESTS)
      .set({
        approved,
        reviewedAt: new Date().toISOString(),
        reviewedById: userReviewedById,
      })
      .where('id', '=', emergencySubRequestId)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(
    db: DbType,
    id: string,
  ): Promise<EmergencySubRequestRow | undefined> {
    return db
      .deleteFrom(EMERGENCY_SUB_REQUESTS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
