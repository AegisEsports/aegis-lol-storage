// import { db } from '@/database/database.js';
// import {
//   USERS,
//   type NewUserDb,
//   type UpdateUserDb,
//   type UserDb,
// } from '@/database/schema/users.js';

// export class UserService {
//   static create(values: NewUserDb): Promise<UserDb> {}

//   static getById(id: string): Promise<UserDb | undefined> {
//     const userDbRow: UserDb | undefined = db
//       .selectFrom(USERS)
//       .selectAll()
//       .where('id', '=', id)
//       .executeTakeFirst();

//     const
//   }

//   static update(id: string, patch: UpdateUserDb): Promise<UserDb | undefined> {
//     return db.updateTable(USERS).set(patch).where('id');
//   }
// }
