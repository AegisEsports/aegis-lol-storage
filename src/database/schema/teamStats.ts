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

export interface TeamStatsTable extends TableBase {
  league_game_id: string;
  team_id: string | null;
  side: LeagueSide | null;
  win: boolean | null;
  dpm_dealt: number | null;
  gold_per_minute: number | null;
  cs_per_minute: number | null;
  vs_per_minute: number | null;
  first_blood: boolean | null;
  first_tower: boolean | null;
  gold_at_early: number | null;
  gold_diff_early: number | null;
  cs_at_early: number | null;
  cs_diff_early: number | null;
  xp_at_early: number | null;
  xp_diff_early: number | null;
  kills_at_early: number | null;
  deaths_at_early: number | null;
  kills_diff_early: number | null;
  damage_at_early: number | null;
  damage_diff_early: number | null;
  total_kills: number | null;
  total_deaths: number | null;
  total_assists: number | null;
  total_towers: number | null;
  total_dragons: number | null;
  total_voidgrubs: number | null;
  total_heralds: number | null;
  total_atakhans: number | null;
  total_barons: number | null;
  total_damage_dealt: number | null;
  total_gold: number | null;
  total_creep_score: number | null;
  total_vision_score: number | null;
  total_wards_placed: number | null;
  total_control_wards_bought: number | null;
  total_wards_cleared: number | null;
}

export const TEAM_STATS = 'team_stats';

export const createTeamStatsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, TEAM_STATS, (t) =>
    t
      .addColumn('league_game_id', 'uuid', (col) =>
        col
          .notNull()
          .references(`${LEAGUE_GAMES}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('team_id', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('side', 'varchar')
      .addColumn('win', 'boolean')
      .addColumn('dpm_dealt', 'float4')
      .addColumn('gold_per_minute', 'float4')
      .addColumn('cs_per_minute', 'float4')
      .addColumn('vs_per_minute', 'float4')
      .addColumn('first_blood', 'boolean')
      .addColumn('first_tower', 'boolean')
      .addColumn('gold_at_early', 'int4')
      .addColumn('gold_diff_early', 'int4')
      .addColumn('cs_at_early', 'int2')
      .addColumn('cs_diff_early', 'int2')
      .addColumn('xp_at_early', 'int4')
      .addColumn('xp_diff_early', 'int4')
      .addColumn('kills_at_early', 'int2')
      .addColumn('deaths_at_early', 'int2')
      .addColumn('kills_diff_early', 'int2')
      .addColumn('damage_at_early', 'int4')
      .addColumn('damage_diff_early', 'int4')
      .addColumn('total_kills', 'int2')
      .addColumn('total_deaths', 'int2')
      .addColumn('total_assists', 'int2')
      .addColumn('total_towers', 'int2')
      .addColumn('total_dragons', 'int2')
      .addColumn('total_voidgrubs', 'int2')
      .addColumn('total_heralds', 'int2')
      .addColumn('total_atakhans', 'int2')
      .addColumn('total_barons', 'int2')
      .addColumn('total_damage_dealt', 'int4')
      .addColumn('total_gold', 'int4')
      .addColumn('total_creep_score', 'int2')
      .addColumn('total_vision_score', 'int2')
      .addColumn('total_wards_placed', 'int2')
      .addColumn('total_control_wards_bought', 'int2')
      .addColumn('total_wards_cleared', 'int2'),
  );
};

export type TeamStatDb = Selectable<TeamStatsTable>;
export type NewTeamStatDb = Insertable<TeamStatsTable>;
export type UpdateTeamStatDb = Updateable<TeamStatsTable>;
