import { USERS } from '@/database/const.js';
import {
  type InsertUser,
  type UpdateUser,
  type UserRow,
} from '@/database/schema.js';
import type { DbType } from '@/database/types.js';

export class UsersQuery {
  // -- INSERT

  static insert(db: DbType, values: InsertUser): Promise<UserRow> {
    return db
      .insertInto(USERS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(db: DbType, id: string): Promise<UserRow | undefined> {
    return db
      .selectFrom(USERS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static selectByPuuid(
    db: DbType,
    puuid: string,
  ): Promise<UserRow | undefined> {
    return db
      .selectFrom(USERS)
      .innerJoin('riotAccounts as ra', 'ra.userId', 'users.id')
      .selectAll('users')
      .where('ra.riotPuuid', '=', puuid)
      .executeTakeFirst();
  }

  // -- UPDATE

  static updateById(
    db: DbType,
    id: string,
    update: UpdateUser,
  ): Promise<UserRow | undefined> {
    return db
      .updateTable(USERS)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(db: DbType, id: string): Promise<UserRow | undefined> {
    return db
      .deleteFrom(USERS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
