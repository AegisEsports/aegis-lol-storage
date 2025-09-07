import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';

export interface LeaguesTable extends TableBase {
  name: string | null;
  riotProviderId: number | null;
}

export const LEAGUES = 'leagues';

export const createLeaguesTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, LEAGUES, (t) =>
    t.addColumn('name', 'varchar').addColumn('riot_provider_id', 'int4'),
  );
};

export type LeagueRow = Selectable<LeaguesTable>;
export type InsertLeague = Insertable<LeaguesTable>;
export type UpdateLeague = Updateable<LeaguesTable>;
