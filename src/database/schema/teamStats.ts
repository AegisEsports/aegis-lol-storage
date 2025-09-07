import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import { LEAGUE_GAMES_SNAKE_CASE } from './leagueGames.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import type { LeagueSide } from './shared/types.js';
import { TEAMS } from './teams.js';

export interface TeamStatsTable extends TableBase {
  leagueGameId: string;
  teamId: string | null;
  side: LeagueSide | null;
  win: boolean | null;
  dpmDealt: number | null;
  goldPerMinute: number | null;
  csPerMinute: number | null;
  vsPerMinute: number | null;
  firstBlood: boolean | null;
  firstTower: boolean | null;
  goldAtEarly: number | null;
  goldDiffEarly: number | null;
  csAtEarly: number | null;
  csDiffEarly: number | null;
  xpAtEarly: number | null;
  xpDiffEarly: number | null;
  killsAtEarly: number | null;
  deathsAtEarly: number | null;
  killsDiffEarly: number | null;
  damageAtEarly: number | null;
  damageDiffEarly: number | null;
  totalKills: number | null;
  totalDeaths: number | null;
  totalAssists: number | null;
  totalTowers: number | null;
  totalDragons: number | null;
  totalVoidgrubs: number | null;
  totalHeralds: number | null;
  totalAtakhans: number | null;
  totalBarons: number | null;
  totalDamageDealt: number | null;
  totalGold: number | null;
  totalCreepScore: number | null;
  totalVisionScore: number | null;
  totalWardsPlaced: number | null;
  totalControlWardsBought: number | null;
  totalWardsCleared: number | null;
}

export const TEAM_STATS = 'teamStats';
export const TEAM_STATS_SNAKE_CASE = 'team_stats';

export const createTeamStatsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, TEAM_STATS_SNAKE_CASE, (t) =>
    t
      .addColumn('league_game_id', 'uuid', (col) =>
        col
          .notNull()
          .references(`${LEAGUE_GAMES_SNAKE_CASE}.id`)
          .onDelete('cascade')
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

export type TeamStatRow = Selectable<TeamStatsTable>;
export type InsertTeamStat = Insertable<TeamStatsTable>;
export type UpdateTeamStat = Updateable<TeamStatsTable>;
