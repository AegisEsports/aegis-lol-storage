import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  TEAM_ROSTERS_SNAKE_CASE,
  TEAMS_SNAKE_CASE,
  USERS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  createTableWithBase,
  ROSTER_ROLES,
  type TableBase,
} from '@/database/shared.js';

export const teamRosterRowSchema = z.strictObject({
  teamId: z.uuid(),
  userId: z.uuid().nullable(),
  role: z.enum(ROSTER_ROLES),
});

type TeamRosterFields = z.infer<typeof teamRosterRowSchema>;

export interface TeamRostersTable extends TeamRosterFields, TableBase {}

export const createTeamRostersTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, TEAM_ROSTERS_SNAKE_CASE, (t) =>
    t
      .addColumn('team_id', 'uuid', (col) =>
        col
          .notNull()
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('user_id', 'uuid', (col) =>
        col
          .references(`${USERS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('role', 'varchar', (col) => col.notNull()),
  );
};

export type TeamRosterRow = Selectable<TeamRostersTable>;
export type InsertTeamRoster = Insertable<TeamRostersTable>;
export type UpdateTeamRoster = Updateable<TeamRostersTable>;
