import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import type { RosterRole } from './shared/types.js';
import { TEAMS } from './teams.js';
import { USERS } from './users.js';

export interface TeamRostersTable extends TableBase {
  teamId: string;
  userId: string | null;
  role: RosterRole;
}

export const TEAM_ROSTERS = 'teamRosters';
export const TEAM_ROSTERS_SNAKE_CASE = 'team_rosters';

export const createTeamRostersTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, TEAM_ROSTERS_SNAKE_CASE, (t) =>
    t
      .addColumn('team_id', 'uuid', (col) =>
        col
          .notNull()
          .references(`${TEAMS}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('user_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('role', 'varchar', (col) => col.notNull()),
  );
};

export type TeamRosterRow = Selectable<TeamRostersTable>;
export type InsertTeamRoster = Insertable<TeamRostersTable>;
export type UpdateTeamRoster = Updateable<TeamRostersTable>;
