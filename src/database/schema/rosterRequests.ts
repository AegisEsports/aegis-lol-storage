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
  teamId: string | null;
  submittedById: string | null;
  userId: string | null;
  rosterMoveType: RosterMoveType | null;
  roleNew: LeagueRole | null;
  roleFormer: LeagueRole | null;
  approved: boolean | null;
  reviewedById: string | null;
}

export const ROSTER_REQUESTS = 'rosterRequests';
export const ROSTER_REQUESTS_SNAKE_CASE = 'roster_requests';

export const createRosterRequestsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, ROSTER_REQUESTS_SNAKE_CASE, (t) =>
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
      .addColumn('reviewed_by_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      ),
  );
};

export type RosterRequestRow = Selectable<RosterRequestsTable>;
export type InsertRosterRequest = Insertable<RosterRequestsTable>;
export type UpdateRosterRequest = Updateable<RosterRequestsTable>;
