import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import { LEAGUE_GAMES_SNAKE_CASE } from './leagueGames.js';
import { RIOT_ACCOUNTS_SNAKE_CASE } from './riotAccounts.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import type { LeagueRole, LeagueSide } from './shared/types.js';
import { TEAMS } from './teams.js';

export interface PlayerStatsTable extends TableBase {
  leagueGameId: string;
  riotPuuid: string | null;
  teamId: string | null;
  playerRole: LeagueRole | null;
  side: LeagueSide | null;
  champId: number | null;
  champName: string | null;
  win: boolean | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  dpmDealt: number | null;
  dpmDiff: number | null;
  csPerMinute: number | null;
  goldPerMinute: number | null;
  vsPerMinute: number | null;
  firstBloodKill: boolean | null;
  firstBloodAssist: boolean | null;
  firstTower: boolean | null;
  killsAtEarly: number | null;
  deathsAtEarly: number | null;
  assistsAtEarly: number | null;
  csAtEarly: number | null;
  csDiffEarly: number | null;
  goldAtEarly: number | null;
  goldDiffEarly: number | null;
  xpAtEarly: number | null;
  xpDiffEarly: number | null;
  damageAtEarly: number | null;
  damageDiffEarly: number | null;
  damageDealt: number | null;
  gold: number | null;
  creepScore: number | null;
  visionScore: number | null;
  wardsPlaced: number | null;
  controlWardsBought: number | null;
  wardsCleared: number | null;
  soloKills: number | null;
  doubleKills: number | null;
  tripleKills: number | null;
  quadraKills: number | null;
  pentaKills: number | null;
}

export const PLAYER_STATS = 'playerStats';
export const PLAYER_STATS_SNAKE_CASE = 'player_stats';

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

export type PlayerStatRow = Selectable<PlayerStatsTable>;
export type InsertPlayerStat = Insertable<PlayerStatsTable>;
export type UpdatePlayerStat = Updateable<PlayerStatsTable>;
