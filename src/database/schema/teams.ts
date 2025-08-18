import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import { ORGANIZATIONS } from './organizations.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import { SPLITS } from './splits.js';

export interface TeamsTable extends TableBase {
  name: string | null;
  split_id: string | null;
  organization_id: string | null;
  team_abbreviation: string | null;
  team_color: string | null;
  team_logo_url: string | null;
}

export const TEAMS = 'teams';

export const createTeamsTable = async (db: Kysely<Database>): Promise<void> => {
  await createTableWithBase(db, TEAMS, (t) =>
    t
      .addColumn('name', 'varchar')
      .addColumn('split_id', 'uuid', (col) =>
        col.references(`${SPLITS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('organization_id', 'uuid', (col) =>
        col
          .references(`${ORGANIZATIONS}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('team_abbreviation', 'varchar(4)')
      .addColumn('team_color', 'varchar(7)')
      .addColumn('team_logo_url', 'varchar'),
  );
};

export type Teams = Selectable<TeamsTable>;
export type NewTeams = Insertable<TeamsTable>;
export type UpdateTeams = Updateable<TeamsTable>;
