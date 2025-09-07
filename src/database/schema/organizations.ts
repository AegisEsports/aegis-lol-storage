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
  ownerId: string | null;
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

export type OrganizationRow = Selectable<OrganizationsTable>;
export type InsertOrganization = Insertable<OrganizationsTable>;
export type UpdateOrganization = Updateable<OrganizationsTable>;
