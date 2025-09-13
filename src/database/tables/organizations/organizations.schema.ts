import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  ORGANIZATIONS_SNAKE_CASE,
  USERS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import { createTableWithBase, type TableBase } from '@/database/shared.js';

export const organizationRowSchema = z.strictObject({
  name: z.string().nullable(),
  ownerId: z.uuid().nullable(),
});
type OrganizationFields = z.infer<typeof organizationRowSchema>;
export type OrganizationsTable = TableBase & OrganizationFields;

export const createOrganizationsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, ORGANIZATIONS_SNAKE_CASE, (t) =>
    t
      .addColumn('name', 'varchar')
      .addColumn('owner_id', 'uuid', (col) =>
        col
          .references(`${USERS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      ),
  );
};

export type OrganizationRow = Selectable<OrganizationsTable>;
export type InsertOrganization = Insertable<OrganizationsTable>;
export type UpdateOrganization = Updateable<OrganizationsTable>;
