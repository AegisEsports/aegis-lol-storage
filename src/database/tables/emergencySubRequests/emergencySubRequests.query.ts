import { EMERGENCY_SUB_REQUESTS, TEAMS } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertEmergencySubRequest,
  type EmergencySubRequestRow,
  type UpdateEmergencySubRequest,
} from '@/database/schema.js';

export class EmergencySubRequestsQuery {
  // -- INSERT

  static insert(
    values: InsertEmergencySubRequest,
  ): Promise<EmergencySubRequestRow> {
    return db
      .insertInto(EMERGENCY_SUB_REQUESTS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<EmergencySubRequestRow | undefined> {
    return db
      .selectFrom(EMERGENCY_SUB_REQUESTS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listBySplitId(splitId: string): Promise<EmergencySubRequestRow[]> {
    return db
      .selectFrom(`${EMERGENCY_SUB_REQUESTS} as esb`)
      .innerJoin(`${TEAMS} as t`, 't.id', 'esb.teamId')
      .where('t.splitId', '=', splitId)
      .selectAll('esb')
      .orderBy('esb.createdAt', 'desc')
      .execute();
  }

  // -- UPDATE

  static updateById(
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

  // -- DELETE

  static deleteById(id: string): Promise<EmergencySubRequestRow | undefined> {
    return db
      .deleteFrom(EMERGENCY_SUB_REQUESTS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
