import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  ROSTER_REQUESTS_SNAKE_CASE,
  TEAMS_SNAKE_CASE,
  USERS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  createTableWithBase,
  LEAGUE_ROLES,
  ROSTER_MOVE_TYPES,
  type TableBase,
} from '@/database/shared.js';

export const rosterRequestRowSchema = z.strictObject({
  teamId: z.uuid().nullable(),
  submittedById: z.uuid().nullable(),
  userId: z.uuid().nullable(),
  rosterMoveType: z.enum(ROSTER_MOVE_TYPES).nullable(),
  roleNew: z.enum(LEAGUE_ROLES).nullable(),
  roleFormer: z.enum(LEAGUE_ROLES).nullable(),
  approved: z.coerce.boolean().nullable(),
  approvedAt: z.iso.date().nullable(),
  reviewedById: z.uuid().nullable(),
});

type RosterRequestFields = z.infer<typeof rosterRequestRowSchema>;

export interface RosterRequestsTable extends RosterRequestFields, TableBase {}

export const createRosterRequestsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, ROSTER_REQUESTS_SNAKE_CASE, (t) =>
    t
      .addColumn('team_id', 'uuid', (col) =>
        col
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('submitted_by_id', 'uuid', (col) =>
        col
          .references(`${USERS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('user_id', 'uuid', (col) =>
        col
          .references(`${USERS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('roster_move_type', 'varchar')
      .addColumn('role_new', 'varchar')
      .addColumn('role_former', 'varchar')
      .addColumn('approved', 'boolean')
      .addColumn('approved_at', 'timestamptz')
      .addColumn('reviewed_by_id', 'uuid', (col) =>
        col
          .references(`${USERS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      ),
  );
};

export type RosterRequestRow = Selectable<RosterRequestsTable>;
export type InsertRosterRequest = Insertable<RosterRequestsTable>;
export type UpdateRosterRequest = Updateable<RosterRequestsTable>;
