import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import type { LeagueRole, RosterMoveType } from './shared/types.js';
import { TEAMS } from './teams.js';
import { USERS } from './users.js';

export interface RosterRequestsTable extends TableBase {
  team_id: string | null;
  submitted_by_id: string | null;
  user_id: string | null;
  roster_move_type: RosterMoveType | null;
  role_new: LeagueRole | null;
  role_former: LeagueRole | null;
  approved: boolean | null;
  approved_by_id: string | null;
}

export const ROSTER_REQUESTS = 'roster_requests';

export const createRosterRequestsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, ROSTER_REQUESTS, (t) =>
    t
      .addColumn('team_id', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('submitted_by_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('user_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('roster_move_type', 'varchar')
      .addColumn('role_new', 'varchar')
      .addColumn('role_former', 'varchar')
      .addColumn('approved', 'boolean')
      .addColumn('approved_by_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      ),
  );
};

export type RosterRequests = Selectable<RosterRequestsTable>;
export type NewRosterRequests = Insertable<RosterRequestsTable>;
export type UpdateRosterRequests = Updateable<RosterRequestsTable>;
