import { db } from '@/database/database.js';
import {
  USERS,
  type InsertUser,
  type UpdateUser,
  type UserRow,
} from '@/database/schema/users.js';

export class UserService {
  /**
   * POST - /
   * 
   * Creates a singular entry of a user. It will also create multiple entries
   *   of Riot accounts and Discord accounts if included.
   */
  static create(values: InsertUser): Promise<UserRow> {}

  static getById(id: string): Promise<UserRow | undefined> {
    const userDbRow: UserRow | undefined = db
      .selectFrom(USERS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    const 
  }

  static update(id: string, update: UpdateUser): Promise<UserRow | undefined> {
    return db.updateTable(USERS).set(update).where('id');
  }
}
