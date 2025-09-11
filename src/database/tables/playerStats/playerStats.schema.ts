import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  LEAGUE_GAMES_SNAKE_CASE,
  PLAYER_STATS_SNAKE_CASE,
  RIOT_ACCOUNTS_SNAKE_CASE,
  TEAMS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  createTableWithBase,
  LEAGUE_ROLES,
  LEAGUE_SIDES,
  type TableBase,
} from '@/database/shared.js';

export const playerStatRowSchema = z.strictObject({
  leagueGameId: z.uuid(),
  riotPuuid: z.string().nullable(),
  teamId: z.uuid().nullable(),
  playerRole: z.enum(LEAGUE_ROLES).nullable(),
  side: z.enum(LEAGUE_SIDES).nullable(),
  champId: z.coerce.number().int().nullable(),
  champName: z.string().nullable(),
  win: z.coerce.boolean().nullable(),
  kills: z.coerce.number().int().nullable(),
  deaths: z.coerce.number().int().nullable(),
  assists: z.coerce.number().int().nullable(),
  dpmDealt: z.coerce.number().nullable(),
  dpmDiff: z.coerce.number().nullable(),
  csPerMinute: z.coerce.number().nullable(),
  goldPerMinute: z.coerce.number().nullable(),
  vsPerMinute: z.coerce.number().nullable(),
  firstBloodKill: z.coerce.boolean().nullable(),
  firstBloodAssist: z.coerce.boolean().nullable(),
  firstTower: z.coerce.boolean().nullable(),
  killsAtEarly: z.coerce.number().int().nullable(),
  deathsAtEarly: z.coerce.number().int().nullable(),
  assistsAtEarly: z.coerce.number().int().nullable(),
  csAtEarly: z.coerce.number().int().nullable(),
  csDiffEarly: z.coerce.number().int().nullable(),
  goldAtEarly: z.coerce.number().int().nullable(),
  goldDiffEarly: z.coerce.number().int().nullable(),
  xpAtEarly: z.coerce.number().int().nullable(),
  xpDiffEarly: z.coerce.number().int().nullable(),
  damageAtEarly: z.coerce.number().int().nullable(),
  damageDiffEarly: z.coerce.number().int().nullable(),
  damageDealt: z.coerce.number().int().nullable(),
  gold: z.coerce.number().int().nullable(),
  creepScore: z.coerce.number().int().nullable(),
  visionScore: z.coerce.number().int().nullable(),
  wardsPlaced: z.coerce.number().int().nullable(),
  controlWardsBought: z.coerce.number().int().nullable(),
  wardsCleared: z.coerce.number().int().nullable(),
  soloKills: z.coerce.number().int().nullable(),
  doubleKills: z.coerce.number().int().nullable(),
  tripleKills: z.coerce.number().int().nullable(),
  quadraKills: z.coerce.number().int().nullable(),
  pentaKills: z.coerce.number().int().nullable(),
});

type PlayerStatFields = z.infer<typeof playerStatRowSchema>;

export interface PlayerStatsTable extends PlayerStatFields, TableBase {}

export const createPlayerStatsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, PLAYER_STATS_SNAKE_CASE, (t) =>
    t
      .addColumn('league_game_id', 'uuid', (col) =>
        col
          .notNull()
          .references(`${LEAGUE_GAMES_SNAKE_CASE}.id`)
          .onDelete('cascade')
          .onUpdate('cascade'),
      )
      .addColumn('riot_puuid', 'varchar', (col) =>
        col
          .references(`${RIOT_ACCOUNTS_SNAKE_CASE}.riot_puuid`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('team_id', 'uuid', (col) =>
        col
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
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

export type PlayerStatRow = Selectable<PlayerStatsTable>;
export type InsertPlayerStat = Insertable<PlayerStatsTable>;
export type UpdatePlayerStat = Updateable<PlayerStatsTable>;
