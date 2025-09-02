import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import { LEAGUE_GAMES } from './leagueGames.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import type { LeagueSide } from './shared/types.js';
import { TEAMS } from './teams.js';

export interface BannedChampsTable extends TableBase {
  league_game_id: string;
  side_banned_by: LeagueSide | null;
  team_id_banned: string | null;
  team_id_against: string | null;
  champ_id: number | null;
  champ_name: string | null;
}

export const BANNED_CHAMPS = 'banned_champs';

export const createBannedChampsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, BANNED_CHAMPS, (t) =>
    t
      .addColumn('league_game_id', 'uuid', (col) =>
        col
          .notNull()
          .references(`${LEAGUE_GAMES}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('side_banned_by', 'varchar')
      .addColumn('team_id_banned', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('team_id_against', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('champ_id', 'int2')
      .addColumn('champ_name', 'varchar'),
  );
};

export type BannedChampDb = Selectable<BannedChampsTable>;
export type NewBannedChampDb = Insertable<BannedChampsTable>;
export type UpdateBannedChampDb = Updateable<BannedChampsTable>;
