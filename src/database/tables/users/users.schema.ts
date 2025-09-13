import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import { USERS_SNAKE_CASE } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  createTableWithBase,
  USER_ROLES,
  type TableBase,
} from '@/database/shared.js';

export const userRowSchema = z.strictObject({
  username: z.string().min(1).toLowerCase(),
  nickname: z.string().min(1).nullable(),
  userRole: z.enum(USER_ROLES).default('Player'),
});
type UserFields = z.infer<typeof userRowSchema>;
export type UsersTable = TableBase & UserFields;

export const createUsersTable = async (db: Kysely<Database>): Promise<void> => {
  await createTableWithBase(db, USERS_SNAKE_CASE, (t) =>
    t
      .addColumn('username', 'varchar')
      .addColumn('nickname', 'varchar')
      .addColumn('user_role', 'varchar', (col) => col.defaultTo('Player'))
      .addUniqueConstraint(`uq_${USERS_SNAKE_CASE}_username`, ['username']),
  );
};

export type UserRow = Selectable<UsersTable>;
export type InsertUser = Insertable<UsersTable>;
export type UpdateUser = Updateable<UsersTable>;
