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
  teamId: z.uuid(),
  side: z.enum(LEAGUE_SIDES).nullable(),
  win: z.coerce.boolean().nullable(),
  totalKills: z.coerce.number().int().nullable(),
  totalDeaths: z.coerce.number().int().nullable(),
  totalAssists: z.coerce.number().int().nullable(),
  totalDamageDealt: z.coerce.number().int().nullable(),
  totalGold: z.coerce.number().int().nullable(),
  totalCreepScore: z.coerce.number().int().nullable(),
  totalVisionScore: z.coerce.number().int().nullable(),
  totalWardsPlaced: z.coerce.number().int().nullable(),
  totalControlWardsPlaced: z.coerce.number().int().nullable(),
  totalWardTakedowns: z.coerce.number().int().nullable(),
  totalTowers: z.coerce.number().int().nullable(),
  totalInhibitors: z.coerce.number().int().nullable(),
  totalDragons: z.coerce.number().int().nullable(),
  totalVoidgrubs: z.coerce.number().int().nullable(),
  totalHeralds: z.coerce.number().int().nullable(),
  totalAtakhans: z.coerce.number().int().nullable(),
  totalBarons: z.coerce.number().int().nullable(),
  damageDealtPerMinute: z.coerce.number().nullable(),
  goldPerMinute: z.coerce.number().nullable(),
  creepScorePerMinute: z.coerce.number().nullable(),
  visionScorePerMinute: z.coerce.number().nullable(),
  firstBlood: z.coerce.boolean().nullable(),
  firstBloodTimestamp: z.coerce.number().int().nullable(),
  firstTower: z.coerce.boolean().nullable(),
  firstTowerTimestamp: z.coerce.number().int().nullable(),
  firstInhibitor: z.coerce.boolean().nullable(),
  firstInhibitorTimestamp: z.coerce.number().int().nullable(),
  firstDragon: z.coerce.boolean().nullable(),
  firstVoidgrub: z.coerce.boolean().nullable(),
  firstHerald: z.coerce.boolean().nullable(),
  firstAtakhan: z.coerce.boolean().nullable(),
  firstBaron: z.coerce.boolean().nullable(),
  goldAt10: z.coerce.number().int().nullable(),
  goldAt15: z.coerce.number().int().nullable(),
  goldAt20: z.coerce.number().int().nullable(),
  goldDiff10: z.coerce.number().int().nullable(),
  goldDiff15: z.coerce.number().int().nullable(),
  goldDiff20: z.coerce.number().int().nullable(),
  csAt10: z.coerce.number().int().nullable(),
  csAt15: z.coerce.number().int().nullable(),
  csAt20: z.coerce.number().int().nullable(),
  csDiff10: z.coerce.number().int().nullable(),
  csDiff15: z.coerce.number().int().nullable(),
  csDiff20: z.coerce.number().int().nullable(),
  xpAt10: z.coerce.number().int().nullable(),
  xpAt15: z.coerce.number().int().nullable(),
  xpAt20: z.coerce.number().int().nullable(),
  xpDiff10: z.coerce.number().int().nullable(),
  xpDiff15: z.coerce.number().int().nullable(),
  xpDiff20: z.coerce.number().int().nullable(),
  killsAt10: z.coerce.number().int().nullable(),
  killsAt15: z.coerce.number().int().nullable(),
  killsAt20: z.coerce.number().int().nullable(),
  killsDiff10: z.coerce.number().int().nullable(),
  killsDiff15: z.coerce.number().int().nullable(),
  killsDiff20: z.coerce.number().int().nullable(),
  deathsAt10: z.coerce.number().int().nullable(),
  deathsAt15: z.coerce.number().int().nullable(),
  deathsAt20: z.coerce.number().int().nullable(),
  damageAt10: z.coerce.number().int().nullable(),
  damageAt15: z.coerce.number().int().nullable(),
  damageAt20: z.coerce.number().int().nullable(),
  damageDiff10: z.coerce.number().int().nullable(),
  damageDiff15: z.coerce.number().int().nullable(),
  damageDiff20: z.coerce.number().int().nullable(),
  wardsPlacedAt10: z.coerce.number().int().nullable(),
  wardsPlacedAt15: z.coerce.number().int().nullable(),
  wardsPlacedAt20: z.coerce.number().int().nullable(),
  wardsPlacedDiff10: z.coerce.number().int().nullable(),
  wardsPlacedDiff15: z.coerce.number().int().nullable(),
  wardsPlacedDiff20: z.coerce.number().int().nullable(),
  wardsClearedAt10: z.coerce.number().int().nullable(),
  wardsClearedAt15: z.coerce.number().int().nullable(),
  wardsClearedAt20: z.coerce.number().int().nullable(),
  wardsClearedDiff10: z.coerce.number().int().nullable(),
  wardsClearedDiff15: z.coerce.number().int().nullable(),
  wardsClearedDiff20: z.coerce.number().int().nullable(),
});
export type TeamStatFields = z.infer<typeof teamStatRowSchema>;
export type TeamStatsTable = TableBase & TeamStatFields;

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
      // totals
      .addColumn('total_kills', 'int2')
      .addColumn('total_deaths', 'int2')
      .addColumn('total_assists', 'int2')
      .addColumn('total_damage_dealt', 'int4')
      .addColumn('total_gold', 'int4')
      .addColumn('total_creep_score', 'int2')
      .addColumn('total_vision_score', 'int2')
      .addColumn('total_wards_placed', 'int2')
      .addColumn('total_control_wards_placed', 'int2')
      .addColumn('total_ward_takedowns', 'int2')
      .addColumn('total_towers', 'int2')
      .addColumn('total_inhibitors', 'int2')
      .addColumn('total_dragons', 'int2')
      .addColumn('total_voidgrubs', 'int2')
      .addColumn('total_heralds', 'int2')
      .addColumn('total_atakhans', 'int2')
      .addColumn('total_barons', 'int2')
      // per-minute rates
      .addColumn('damage_dealt_per_minute', 'float4')
      .addColumn('gold_per_minute', 'float4')
      .addColumn('creep_score_per_minute', 'float4')
      .addColumn('vision_score_per_minute', 'float4')
      // first objectives
      .addColumn('first_blood', 'boolean')
      .addColumn('first_blood_timestamp', 'int4')
      .addColumn('first_tower', 'boolean')
      .addColumn('first_tower_timestamp', 'int4')
      .addColumn('first_inhibitor', 'boolean')
      .addColumn('first_inhibitor_timestamp', 'int4')
      .addColumn('first_dragon', 'boolean')
      .addColumn('first_voidgrub', 'boolean')
      .addColumn('first_herald', 'boolean')
      .addColumn('first_atakhan', 'boolean')
      .addColumn('first_baron', 'boolean')
      // gold timeline
      .addColumn('gold_at10', 'int4')
      .addColumn('gold_at15', 'int4')
      .addColumn('gold_at20', 'int4')
      .addColumn('gold_diff10', 'int4')
      .addColumn('gold_diff15', 'int4')
      .addColumn('gold_diff20', 'int4')
      // cs timeline
      .addColumn('cs_at10', 'int2')
      .addColumn('cs_at15', 'int2')
      .addColumn('cs_at20', 'int2')
      .addColumn('cs_diff10', 'int2')
      .addColumn('cs_diff15', 'int2')
      .addColumn('cs_diff20', 'int2')
      // xp timeline
      .addColumn('xp_at10', 'int4')
      .addColumn('xp_at15', 'int4')
      .addColumn('xp_at20', 'int4')
      .addColumn('xp_diff10', 'int4')
      .addColumn('xp_diff15', 'int4')
      .addColumn('xp_diff20', 'int4')
      // kills timeline
      .addColumn('kills_at10', 'int2')
      .addColumn('kills_at15', 'int2')
      .addColumn('kills_at20', 'int2')
      .addColumn('kills_diff10', 'int2')
      .addColumn('kills_diff15', 'int2')
      .addColumn('kills_diff20', 'int2')
      // deaths timeline
      .addColumn('deaths_at10', 'int2')
      .addColumn('deaths_at15', 'int2')
      .addColumn('deaths_at20', 'int2')
      // damage timeline
      .addColumn('damage_at10', 'int4')
      .addColumn('damage_at15', 'int4')
      .addColumn('damage_at20', 'int4')
      .addColumn('damage_diff10', 'int4')
      .addColumn('damage_diff15', 'int4')
      .addColumn('damage_diff20', 'int4')
      // wards placed timeline
      .addColumn('wards_placed_at10', 'int2')
      .addColumn('wards_placed_at15', 'int2')
      .addColumn('wards_placed_at20', 'int2')
      .addColumn('wards_placed_diff10', 'int2')
      .addColumn('wards_placed_diff15', 'int2')
      .addColumn('wards_placed_diff20', 'int2')
      // wards cleared timeline
      .addColumn('wards_cleared_at10', 'int2')
      .addColumn('wards_cleared_at15', 'int2')
      .addColumn('wards_cleared_at20', 'int2')
      .addColumn('wards_cleared_diff10', 'int2')
      .addColumn('wards_cleared_diff15', 'int2')
      .addColumn('wards_cleared_diff20', 'int2'),
  );
};

export type TeamStatRow = Selectable<TeamStatsTable>;
export type InsertTeamStat = Insertable<TeamStatsTable>;
export type UpdateTeamStat = Updateable<TeamStatsTable>;
