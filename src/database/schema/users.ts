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
  name: string | null;
  nickname: string | null;
  user_role: UserRole;
}

export const USERS = 'users';

export const createUsersTable = async (db: Kysely<Database>): Promise<void> => {
  await createTableWithBase(db, USERS, (t) =>
    t
      .addColumn('name', 'varchar')
      .addColumn('nickname', 'varchar')
      .addColumn('user_role', 'varchar'),
  );
};

export type Users = Selectable<UsersTable>;
export type NewUsers = Insertable<UsersTable>;
export type UpdateUsers = Updateable<UsersTable>;
