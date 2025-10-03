import {
  sql,
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
  participantId: z.coerce.number(),
  riotPuuid: z.string(),
  riotIgn: z.string().nullable(),
  teamId: z.uuid().nullable(),
  playerRole: z.enum(LEAGUE_ROLES).nullable(),
  side: z.enum(LEAGUE_SIDES).nullable(),
  champId: z.coerce.number().int().nullable(),
  champName: z.string().nullable(),
  win: z.coerce.boolean().nullable(),
  kills: z.coerce.number().int().nullable(),
  deaths: z.coerce.number().int().nullable(),
  assists: z.coerce.number().int().nullable(),
  gold: z.coerce.number().int().nullable(),
  creepScore: z.coerce.number().int().nullable(),
  visionScore: z.coerce.number().int().nullable(),
  wardsPlaced: z.coerce.number().int().nullable(),
  controlWardsPlaced: z.coerce.number().int().nullable(),
  wardTakedowns: z.coerce.number().int().nullable(),
  totalDamageToChamps: z.coerce.number().int().nullable(),
  physicalDamageDealtToChamps: z.coerce.number().int().nullable(),
  magicDamageDealtToChamps: z.coerce.number().int().nullable(),
  trueDamageDealtToChamps: z.coerce.number().int().nullable(),
  damageToTurrets: z.coerce.number().int().nullable(),
  damageToObjectives: z.coerce.number().int().nullable(),
  totalDamageTaken: z.coerce.number().int().nullable(),
  totalHeals: z.coerce.number().int().nullable(),
  totalTimeCrowdControlDealt: z.coerce.number().int().nullable(),
  totalTimeSpentDead: z.coerce.number().int().nullable(),
  damageDealtPerMinute: z.coerce.number().nullable(),
  damageDealtPerMinuteDiff: z.coerce.number().nullable(),
  damageTakenPerMinute: z.coerce.number().nullable(),
  goldPerMinute: z.coerce.number().nullable(),
  creepScorePerMinute: z.coerce.number().nullable(),
  visionScorePerMinute: z.coerce.number().nullable(),
  firstBloodKill: z.coerce.boolean().nullable(),
  firstBloodAssist: z.coerce.boolean().nullable(),
  firstBloodVictim: z.coerce.boolean().nullable(),
  firstTower: z.coerce.boolean().nullable(),
  soloKills: z.coerce.number().int().nullable(),
  doubleKills: z.coerce.number().int().nullable(),
  tripleKills: z.coerce.number().int().nullable(),
  quadraKills: z.coerce.number().int().nullable(),
  pentaKills: z.coerce.number().int().nullable(),
  summoner1Id: z.coerce.number().int().nullable(),
  summoner2Id: z.coerce.number().int().nullable(),
  summoner1Casts: z.coerce.number().int().nullable(),
  summoner2Casts: z.coerce.number().int().nullable(),
  spell1Casts: z.coerce.number().int().nullable(),
  spell2Casts: z.coerce.number().int().nullable(),
  spell3Casts: z.coerce.number().int().nullable(),
  spell4Casts: z.coerce.number().int().nullable(),
  champLevel: z.coerce.number().int().nullable(),
  itemsFinal: z.array(z.coerce.number().int().nullable()).length(7).nullable(),
  killsAt10: z.coerce.number().int().nullable(),
  killsAt15: z.coerce.number().int().nullable(),
  killsAt20: z.coerce.number().int().nullable(),
  deathsAt10: z.coerce.number().int().nullable(),
  deathsAt15: z.coerce.number().int().nullable(),
  deathsAt20: z.coerce.number().int().nullable(),
  assistsAt10: z.coerce.number().int().nullable(),
  assistsAt15: z.coerce.number().int().nullable(),
  assistsAt20: z.coerce.number().int().nullable(),
  csAt10: z.coerce.number().int().nullable(),
  csAt15: z.coerce.number().int().nullable(),
  csAt20: z.coerce.number().int().nullable(),
  csDiff10: z.coerce.number().int().nullable(),
  csDiff15: z.coerce.number().int().nullable(),
  csDiff20: z.coerce.number().int().nullable(),
  goldAt10: z.coerce.number().int().nullable(),
  goldAt15: z.coerce.number().int().nullable(),
  goldAt20: z.coerce.number().int().nullable(),
  goldDiff10: z.coerce.number().int().nullable(),
  goldDiff15: z.coerce.number().int().nullable(),
  goldDiff20: z.coerce.number().int().nullable(),
  xpAt10: z.coerce.number().int().nullable(),
  xpAt15: z.coerce.number().int().nullable(),
  xpAt20: z.coerce.number().int().nullable(),
  xpDiff10: z.coerce.number().int().nullable(),
  xpDiff15: z.coerce.number().int().nullable(),
  xpDiff20: z.coerce.number().int().nullable(),
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
  wardTakedownsBefore20: z.coerce.number().int().nullable(),
  wardTakedownsDiff20: z.coerce.number().int().nullable(),
  pingsAllIn: z.coerce.number().int().nullable(),
  pingsAssistMe: z.coerce.number().int().nullable(),
  pingsCaution: z.coerce.number().int().nullable(),
  pingsCommand: z.coerce.number().int().nullable(),
  pingsEnemyMissing: z.coerce.number().int().nullable(),
  pingsEnemyVision: z.coerce.number().int().nullable(),
  pingsNeedVision: z.coerce.number().int().nullable(),
  pingsOnMyWay: z.coerce.number().int().nullable(),
  pingsPush: z.coerce.number().int().nullable(),
  pingsRetreat: z.coerce.number().int().nullable(),
});
export type PlayerStatFields = z.infer<typeof playerStatRowSchema>;
export type PlayerStatsTable = TableBase & PlayerStatFields;

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
      .addColumn('participant_id', 'smallint')
      .addColumn('riot_puuid', 'varchar', (col) =>
        col
          .references(`${RIOT_ACCOUNTS_SNAKE_CASE}.riot_puuid`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('riot_ign', 'varchar')
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
      // core tallies
      .addColumn('kills', 'int2')
      .addColumn('deaths', 'int2')
      .addColumn('assists', 'int2')
      .addColumn('gold', 'int4')
      .addColumn('creep_score', 'int2')
      .addColumn('vision_score', 'int2')
      .addColumn('wards_placed', 'int2')
      .addColumn('control_wards_placed', 'int2')
      .addColumn('ward_takedowns', 'int2')
      // damage/heal/time aggregates
      .addColumn('total_damage_to_champs', 'int4')
      .addColumn('physical_damage_dealt_to_champs', 'int4')
      .addColumn('magic_damage_dealt_to_champs', 'int4')
      .addColumn('true_damage_dealt_to_champs', 'int4')
      .addColumn('damage_to_turrets', 'int4')
      .addColumn('damage_to_objectives', 'int4')
      .addColumn('total_damage_taken', 'int4')
      .addColumn('total_heals', 'int4')
      .addColumn('total_time_crowd_control_dealt', 'int4')
      .addColumn('total_time_spent_dead', 'int4')
      // per-minute rates
      .addColumn('damage_dealt_per_minute', 'float4')
      .addColumn('damage_dealt_per_minute_diff', 'float4')
      .addColumn('damage_taken_per_minute', 'float4')
      .addColumn('gold_per_minute', 'float4')
      .addColumn('creep_score_per_minute', 'float4')
      .addColumn('vision_score_per_minute', 'float4')
      // first objectives
      .addColumn('first_blood_kill', 'boolean')
      .addColumn('first_blood_assist', 'boolean')
      .addColumn('first_blood_victim', 'boolean')
      .addColumn('first_tower', 'boolean')
      // multi-kill tallies
      .addColumn('solo_kills', 'int2')
      .addColumn('double_kills', 'int2')
      .addColumn('triple_kills', 'int2')
      .addColumn('quadra_kills', 'int2')
      .addColumn('penta_kills', 'int2')
      // summoners/spells/level/items
      .addColumn('summoner1_id', 'int2')
      .addColumn('summoner2_id', 'int2')
      .addColumn('summoner1_casts', 'int2')
      .addColumn('summoner2_casts', 'int2')
      .addColumn('spell1_casts', 'int2')
      .addColumn('spell2_casts', 'int2')
      .addColumn('spell3_casts', 'int2')
      .addColumn('spell4_casts', 'int2')
      .addColumn('champ_level', 'int2')
      .addColumn('items_final', sql`integer[]`)
      // timelines (kills/deaths/assists)
      .addColumn('kills_at10', 'int2')
      .addColumn('kills_at15', 'int2')
      .addColumn('kills_at20', 'int2')
      .addColumn('deaths_at10', 'int2')
      .addColumn('deaths_at15', 'int2')
      .addColumn('deaths_at20', 'int2')
      .addColumn('assists_at10', 'int2')
      .addColumn('assists_at15', 'int2')
      .addColumn('assists_at20', 'int2')
      // cs timelines
      .addColumn('cs_at10', 'int2')
      .addColumn('cs_at15', 'int2')
      .addColumn('cs_at20', 'int2')
      .addColumn('cs_diff10', 'int2')
      .addColumn('cs_diff15', 'int2')
      .addColumn('cs_diff20', 'int2')
      // gold timelines
      .addColumn('gold_at10', 'int4')
      .addColumn('gold_at15', 'int4')
      .addColumn('gold_at20', 'int4')
      .addColumn('gold_diff10', 'int4')
      .addColumn('gold_diff15', 'int4')
      .addColumn('gold_diff20', 'int4')
      // xp timelines
      .addColumn('xp_at10', 'int4')
      .addColumn('xp_at15', 'int4')
      .addColumn('xp_at20', 'int4')
      .addColumn('xp_diff10', 'int4')
      .addColumn('xp_diff15', 'int4')
      .addColumn('xp_diff20', 'int4')
      // damage timelines
      .addColumn('damage_at10', 'int4')
      .addColumn('damage_at15', 'int4')
      .addColumn('damage_at20', 'int4')
      .addColumn('damage_diff10', 'int4')
      .addColumn('damage_diff15', 'int4')
      .addColumn('damage_diff20', 'int4')
      // wards placed timelines
      .addColumn('wards_placed_at10', 'int2')
      .addColumn('wards_placed_at15', 'int2')
      .addColumn('wards_placed_at20', 'int2')
      .addColumn('wards_placed_diff10', 'int2')
      .addColumn('wards_placed_diff15', 'int2')
      .addColumn('wards_placed_diff20', 'int2')
      // ward takedowns time-bounded
      .addColumn('ward_takedowns_before20', 'int2')
      .addColumn('ward_takedowns_diff20', 'int2')
      // pings
      .addColumn('pings_all_in', 'int2')
      .addColumn('pings_assist_me', 'int2')
      .addColumn('pings_caution', 'int2')
      .addColumn('pings_command', 'int2')
      .addColumn('pings_enemy_missing', 'int2')
      .addColumn('pings_enemy_vision', 'int2')
      .addColumn('pings_need_vision', 'int2')
      .addColumn('pings_on_my_way', 'int2')
      .addColumn('pings_push', 'int2')
      .addColumn('pings_retreat', 'int2'),
  );
};

export type PlayerStatRow = Selectable<PlayerStatsTable>;
export type InsertPlayerStat = Insertable<PlayerStatsTable>;
export type UpdatePlayerStat = Updateable<PlayerStatsTable>;
