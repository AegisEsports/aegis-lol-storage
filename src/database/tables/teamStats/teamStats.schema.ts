import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  LEAGUE_GAMES_SNAKE_CASE,
  TEAM_STATS_SNAKE_CASE,
  TEAMS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  createTableWithBase,
  LEAGUE_SIDES,
  type TableBase,
} from '@/database/shared.js';

export const teamStatRowSchema = z.strictObject({
  leagueGameId: z.uuid(),
  teamId: z.uuid().nullable(),
  side: z.enum(LEAGUE_SIDES).nullable(),
  win: z.coerce.boolean().nullable(),
  dpmDealt: z.coerce.number().nullable(),
  goldPerMinute: z.coerce.number().nullable(),
  csPerMinute: z.coerce.number().nullable(),
  vsPerMinute: z.coerce.number().nullable(),
  firstBlood: z.coerce.boolean().nullable(),
  firstTower: z.coerce.boolean().nullable(),
  goldAtEarly: z.coerce.number().int().nullable(),
  goldDiffEarly: z.coerce.number().int().nullable(),
  csAtEarly: z.coerce.number().int().nullable(),
  csDiffEarly: z.coerce.number().int().nullable(),
  xpAtEarly: z.coerce.number().int().nullable(),
  xpDiffEarly: z.coerce.number().int().nullable(),
  killsAtEarly: z.coerce.number().int().nullable(),
  deathsAtEarly: z.coerce.number().int().nullable(),
  killsDiffEarly: z.coerce.number().int().nullable(),
  damageAtEarly: z.coerce.number().int().nullable(),
  damageDiffEarly: z.coerce.number().int().nullable(),
  totalKills: z.coerce.number().int().nullable(),
  totalDeaths: z.coerce.number().int().nullable(),
  totalAssists: z.coerce.number().int().nullable(),
  totalTowers: z.coerce.number().int().nullable(),
  totalDragons: z.coerce.number().int().nullable(),
  totalVoidgrubs: z.coerce.number().int().nullable(),
  totalHeralds: z.coerce.number().int().nullable(),
  totalAtakhans: z.coerce.number().int().nullable(),
  totalBarons: z.coerce.number().int().nullable(),
  totalDamageDealt: z.coerce.number().int().nullable(),
  totalGold: z.coerce.number().int().nullable(),
  totalCreepScore: z.coerce.number().int().nullable(),
  totalVisionScore: z.coerce.number().int().nullable(),
  totalWardsPlaced: z.coerce.number().int().nullable(),
  totalControlWardsBought: z.coerce.number().int().nullable(),
  totalWardsCleared: z.coerce.number().int().nullable(),
});

type TeamStatFields = z.infer<typeof teamStatRowSchema>;

export interface TeamStatsTable extends TeamStatFields, TableBase {}

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
        col
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
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
