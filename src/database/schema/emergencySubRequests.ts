import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import { TEAMS } from './teams.js';
import { USERS } from './users.js';

export interface EmergencySubRequestsTable extends TableBase {
  submitted_by_id: string | null;
  user_id: string | null;
  team_id: string | null;
  approved: boolean | null;
  approved_by_id: string | null;
}

export const EMERGENCY_SUB_REQUESTS = 'emergency_sub_requests';

export const createEmergencySubRequestsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, EMERGENCY_SUB_REQUESTS, (t) =>
    t
      .addColumn('submitted_by_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('user_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('team_id', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('approved', 'boolean')
      .addColumn('approved_by_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      ),
  );
};

export type EmergencySubRequest = Selectable<EmergencySubRequestsTable>;
export type NewEmergencySubRequest = Insertable<EmergencySubRequestsTable>;
export type UpdateEmergencySubRequest = Updateable<EmergencySubRequestsTable>;
