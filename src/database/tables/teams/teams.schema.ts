import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  ORGANIZATIONS_SNAKE_CASE,
  SPLITS_SNAKE_CASE,
  TEAMS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import { createTableWithBase, type TableBase } from '@/database/shared.js';

export const teamRowSchema = z.strictObject({
  name: z.string().nullable(),
  splitId: z.uuid().nullable(),
  organizationId: z.uuid().nullable(),
  teamAbbreviation: z.string().nullable(),
  teamColor: z.string().nullable(),
  teamLogoUrl: z.string().nullable(),
});
type TeamFields = z.infer<typeof teamRowSchema>;
export type TeamsTable = TableBase & TeamFields;

export const createTeamsTable = async (db: Kysely<Database>): Promise<void> => {
  await createTableWithBase(db, TEAMS_SNAKE_CASE, (t) =>
    t
      .addColumn('name', 'varchar')
      .addColumn('split_id', 'uuid', (col) =>
        col
          .references(`${SPLITS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('organization_id', 'uuid', (col) =>
        col
          .references(`${ORGANIZATIONS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('team_abbreviation', 'varchar(4)')
      .addColumn('team_color', 'varchar(7)')
      .addColumn('team_logo_url', 'varchar'),
  );
};

export type TeamRow = Selectable<TeamsTable>;
export type InsertTeam = Insertable<TeamsTable>;
export type UpdateTeam = Updateable<TeamsTable>;
