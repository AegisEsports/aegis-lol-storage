import { db } from '@/database/database.js';
import {
  USERS,
  // type NewUser,
  // type UpdateUser,
  type User,
} from '@/database/schema/users.js';

export class UserService {
  // static create(values: NewUser): Promise<User> {}

  static getById(id: string): Promise<User | undefined> {
    return db
      .selectFrom(USERS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // static update(id: string, patch: UpdateUser): Promise<User | undefined> {
  //   return db.updateTable(USERS).set(patch).where('id');
  // }
}
