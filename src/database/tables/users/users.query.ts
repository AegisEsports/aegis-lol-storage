import { USERS } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertUser,
  type UpdateUser,
  type UserRow,
} from '@/database/schema.js';

export class UsersQuery {
  // -- INSERT

  static insert(values: InsertUser): Promise<UserRow> {
    return db
      .insertInto(USERS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<UserRow | undefined> {
    return db
      .selectFrom(USERS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE

  static updateById(
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

  static deleteById(id: string): Promise<UserRow | undefined> {
    return db
      .deleteFrom(USERS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
