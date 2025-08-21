import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import { USERS } from './users.js';

export interface OrganizationsTable extends TableBase {
  name: string | null;
  owner_id: string | null;
}

export const ORGANIZATIONS = 'organizations';

export const createOrganizationsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, ORGANIZATIONS, (t) =>
    t
      .addColumn('name', 'varchar')
      .addColumn('owner_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      ),
  );
};

export type Organizations = Selectable<OrganizationsTable>;
export type NewOrganizations = Insertable<OrganizationsTable>;
export type UpdateOrganizations = Updateable<OrganizationsTable>;
