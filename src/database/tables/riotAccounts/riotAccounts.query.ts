import { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';

import { RIOT_ACCOUNTS } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertRiotAccount,
  type RiotAccountRow,
  type UpdateRiotAccount,
} from '@/database/schema.js';
import ControllerError from '@/util/errors/controllerError.js';

export class RiotAccountsQuery {
  // -- INSERT

  static insert(values: InsertRiotAccount): Promise<RiotAccountRow> {
    return db
      .insertInto(RIOT_ACCOUNTS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<RiotAccountRow | undefined> {
    return db
      .selectFrom(RIOT_ACCOUNTS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static selectByPuuid(puuid: string): Promise<RiotAccountRow | undefined> {
    return db
      .selectFrom(RIOT_ACCOUNTS)
      .selectAll()
      .where('riotPuuid', '=', puuid)
      .executeTakeFirst();
  }

  static listByUserId(userId: string): Promise<RiotAccountRow[]> {
    return db
      .selectFrom(RIOT_ACCOUNTS)
      .selectAll()
      .where('userId', '=', userId)
      .execute();
  }

  // -- UPDATE

  static updateById(
    id: string,
    update: UpdateRiotAccount,
  ): Promise<RiotAccountRow | undefined> {
    return db
      .updateTable(RIOT_ACCOUNTS)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  static setWithUserId(
    riotAccountId: string,
    userId: string,
  ): Promise<RiotAccountRow | undefined> {
    try {
      return db
        .updateTable(RIOT_ACCOUNTS)
        .set({ userId })
        .where('id', '=', riotAccountId)
        .returningAll()
        .executeTakeFirst();
    } catch (e) {
      if (
        e instanceof DatabaseError &&
        e.code === PostgresError.FOREIGN_KEY_VIOLATION
      ) {
        // userId does not exist
        throw new ControllerError(404, 'NotFound', 'User not found.', {
          userId,
        });
      }
      throw e;
    }
  }

  // -- DELETE

  static deleteById(id: string): Promise<RiotAccountRow | undefined> {
    return db
      .deleteFrom(RIOT_ACCOUNTS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
