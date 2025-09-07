import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import type { UserRole } from './shared/types.js';

export interface UsersTable extends TableBase {
  username: string | null;
  nickname: string | null;
  userRole: UserRole;
}

export const USERS = 'users';

export const createUsersTable = async (db: Kysely<Database>): Promise<void> => {
  await createTableWithBase(db, USERS, (t) =>
    t
      .addColumn('username', 'varchar')
      .addColumn('nickname', 'varchar')
      .addColumn('user_role', 'varchar'),
  );
};

export type UserRow = Selectable<UsersTable>;
export type InsertUser = Insertable<UsersTable>;
export type UpdateUser = Updateable<UsersTable>;
