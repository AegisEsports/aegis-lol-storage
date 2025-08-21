import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import { LEAGUE_GAMES } from './leagueGames.js';
import { RIOT_ACCOUNTS } from './riotAccounts.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import type { LeagueRole, LeagueSide } from './shared/types.js';
import { TEAMS } from './teams.js';

export interface PlayerStatsTable extends TableBase {
  league_game_id: string;
  riot_puuid: string | null;
  team_id: string | null;
  player_role: LeagueRole | null;
  side: LeagueSide | null;
  champ_id: number | null;
  champ_name: string | null;
  win: boolean | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  dpm_dealt: number | null;
  dpm_diff: number | null;
  cs_per_minute: number | null;
  gold_per_minute: number | null;
  vs_per_minute: number | null;
  first_blood_kill: boolean | null;
  first_blood_assist: boolean | null;
  first_tower: boolean | null;
  kills_at_early: number | null;
  deaths_at_early: number | null;
  assists_at_early: number | null;
  cs_at_early: number | null;
  cs_diff_early: number | null;
  gold_at_early: number | null;
  gold_diff_early: number | null;
  xp_at_early: number | null;
  xp_diff_early: number | null;
  damage_at_early: number | null;
  damage_diff_early: number | null;
  damage_dealt: number | null;
  gold: number | null;
  creep_score: number | null;
  vision_score: number | null;
  wards_placed: number | null;
  control_wards_bought: number | null;
  wards_cleared: number | null;
  solo_kills: number | null;
  double_kills: number | null;
  triple_kills: number | null;
  quadra_kills: number | null;
  penta_kills: number | null;
}

export const PLAYER_STATS = 'player_stats';

export const createPlayerStatsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, PLAYER_STATS, (t) =>
    t
      .addColumn('league_game_id', 'uuid', (col) =>
        col
          .notNull()
          .references(`${LEAGUE_GAMES}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('riot_puuid', 'varchar', (col) =>
        col
          .references(`${RIOT_ACCOUNTS}.riot_puuid`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('team_id', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('player_role', 'varchar')
      .addColumn('side', 'varchar')
      .addColumn('champ_id', 'int2')
      .addColumn('champ_name', 'varchar')
      .addColumn('win', 'boolean')
      .addColumn('kills', 'int2')
      .addColumn('deaths', 'int2')
      .addColumn('assists', 'int2')
      .addColumn('dpm_dealt', 'float4')
      .addColumn('dpm_diff', 'float4')
      .addColumn('cs_per_minute', 'float4')
      .addColumn('gold_per_minute', 'float4')
      .addColumn('vs_per_minute', 'float4')
      .addColumn('first_blood_kill', 'boolean')
      .addColumn('first_blood_assist', 'boolean')
      .addColumn('first_tower', 'boolean')
      .addColumn('kills_at_early', 'int2')
      .addColumn('deaths_at_early', 'int2')
      .addColumn('assists_at_early', 'int2')
      .addColumn('cs_at_early', 'int2')
      .addColumn('cs_diff_early', 'int2')
      .addColumn('gold_at_early', 'int2')
      .addColumn('gold_diff_early', 'int2')
      .addColumn('xp_at_early', 'int2')
      .addColumn('xp_diff_early', 'int2')
      .addColumn('damage_at_early', 'int4')
      .addColumn('damage_diff_early', 'int4')
      .addColumn('damage_dealt', 'int4')
      .addColumn('gold', 'int2')
      .addColumn('creep_score', 'int2')
      .addColumn('vision_score', 'int2')
      .addColumn('wards_placed', 'int2')
      .addColumn('control_wards_bought', 'int2')
      .addColumn('wards_cleared', 'int2')
      .addColumn('solo_kills', 'int2')
      .addColumn('double_kills', 'int2')
      .addColumn('triple_kills', 'int2')
      .addColumn('quadra_kills', 'int2')
      .addColumn('penta_kills', 'int2'),
  );
};

export type PlayerStats = Selectable<PlayerStatsTable>;
export type NewPlayerStats = Insertable<PlayerStatsTable>;
export type UpdatePlayerStats = Updateable<PlayerStatsTable>;
