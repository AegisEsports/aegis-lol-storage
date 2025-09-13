import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import { LEAGUES_SNAKE_CASE } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import { createTableWithBase, type TableBase } from '@/database/shared.js';

export const leagueRowSchema = z.strictObject({
  name: z.string().nullable(),
  riotProviderId: z.coerce.number().int().nullable(),
});
type LeagueRowFields = z.infer<typeof leagueRowSchema>;
export type LeaguesTable = TableBase & LeagueRowFields;

export const createLeaguesTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, LEAGUES_SNAKE_CASE, (t) =>
    t.addColumn('name', 'varchar').addColumn('riot_provider_id', 'int4'),
  );
};

export type LeagueRow = Selectable<LeaguesTable>;
export type InsertLeague = Insertable<LeaguesTable>;
export type UpdateLeague = Updateable<LeaguesTable>;
