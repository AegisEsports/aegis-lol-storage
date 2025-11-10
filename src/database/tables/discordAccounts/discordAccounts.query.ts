import type { Kysely } from 'kysely';
import { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';

import { DISCORD_ACCOUNTS } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  type DiscordAccountRow,
  type InsertDiscordAccount,
  type UpdateDiscordAccount,
} from '@/database/schema.js';
import ControllerError from '@/util/errors/controllerError.js';

export class DiscordAccountsQuery {
  // -- INSERT

  static insert(
    db: Kysely<Database>,
    values: InsertDiscordAccount,
  ): Promise<DiscordAccountRow> {
    return db
      .insertInto(DISCORD_ACCOUNTS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: Kysely<Database>,
    id: string,
  ): Promise<DiscordAccountRow | undefined> {
    return db
      .selectFrom(DISCORD_ACCOUNTS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByUserId(
    db: Kysely<Database>,
    userId: string,
  ): Promise<DiscordAccountRow[]> {
    return db
      .selectFrom(DISCORD_ACCOUNTS)
      .selectAll()
      .where('userId', '=', userId)
      .execute();
  }

  // -- UPDATE

  static updateById(
    db: Kysely<Database>,
    id: string,
    update: UpdateDiscordAccount,
  ): Promise<DiscordAccountRow | undefined> {
    return db
      .updateTable(DISCORD_ACCOUNTS)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  static setWithUserId(
    db: Kysely<Database>,
    discordAccountId: string,
    userId: string,
  ): Promise<DiscordAccountRow | undefined> {
    try {
      return db
        .updateTable(DISCORD_ACCOUNTS)
        .set({ userId })
        .where('id', '=', discordAccountId)
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
  ): Promise<DiscordAccountRow | undefined> {
    return db
      .deleteFrom(DISCORD_ACCOUNTS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
