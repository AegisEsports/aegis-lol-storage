import type { Kysely } from 'kysely';
import { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';

import { RIOT_ACCOUNTS } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  type InsertRiotAccount,
  type RiotAccountRow,
  type UpdateRiotAccount,
} from '@/database/schema.js';
import ControllerError from '@/util/errors/controllerError.js';

export class RiotAccountsQuery {
  // -- INSERT

  static insert(
    db: Kysely<Database>,
    values: InsertRiotAccount,
  ): Promise<RiotAccountRow> {
    return db
      .insertInto(RIOT_ACCOUNTS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: Kysely<Database>,
    id: string,
  ): Promise<RiotAccountRow | undefined> {
    return db
      .selectFrom(RIOT_ACCOUNTS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static selectByPuuid(
    db: Kysely<Database>,
    puuid: string,
  ): Promise<RiotAccountRow | undefined> {
    return db
      .selectFrom(RIOT_ACCOUNTS)
      .selectAll()
      .where('riotPuuid', '=', puuid)
      .executeTakeFirst();
  }

  static listByUserId(
    db: Kysely<Database>,
    userId: string,
  ): Promise<RiotAccountRow[]> {
    return db
      .selectFrom(RIOT_ACCOUNTS)
      .selectAll()
      .where('userId', '=', userId)
      .execute();
  }

  // -- UPDATE

  static updateById(
    db: Kysely<Database>,
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
    db: Kysely<Database>,
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

  static deleteById(
    db: Kysely<Database>,
    id: string,
  ): Promise<RiotAccountRow | undefined> {
    return db
      .deleteFrom(RIOT_ACCOUNTS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
