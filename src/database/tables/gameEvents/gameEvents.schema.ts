import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  GAME_EVENTS_SNAKE_CASE,
  LEAGUE_GAMES_SNAKE_CASE,
  RIOT_ACCOUNTS_SNAKE_CASE,
  TEAMS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  createTableWithBase,
  type TableBase,
  EVENT_TYPES,
  LEAGUE_LANES,
  OBJECTIVE_TYPES,
} from '@/database/shared.js';

export const gameEventRowSchema = z.strictObject({
  leagueGameId: z.uuid(),
  riotPuuidKiller: z.string().nullable(),
  teamId: z.uuid().nullable(),
  eventType: z.enum(EVENT_TYPES).nullable(),
  objectiveSubType: z.enum(OBJECTIVE_TYPES).nullable(),
  gameTimestamp: z.coerce.number().int().nullable(),
  lane: z.enum(LEAGUE_LANES).nullable(),
  positionX: z.coerce.number().int().nullable(),
  positionY: z.coerce.number().int().nullable(),
  riotPuuidVictim: z.string().nullable(),
  baronPowerPlay: z.coerce.number().int().nullable(),
});
export type GameEventFields = z.infer<typeof gameEventRowSchema>;
export type GameEventsTable = TableBase & GameEventFields;

export const createGameEventsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, GAME_EVENTS_SNAKE_CASE, (t) =>
    t
      .addColumn('league_game_id', 'uuid', (col) =>
        col
          .notNull()
          .references(`${LEAGUE_GAMES_SNAKE_CASE}.id`)
          .onDelete('cascade')
          .onUpdate('cascade'),
      )
      .addColumn('riot_puuid_killer', 'varchar', (col) =>
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
      .addColumn('event_type', 'varchar')
      .addColumn('objective_sub_type', 'varchar')
      .addColumn('game_timestamp', 'int4')
      .addColumn('lane', 'varchar')
      .addColumn('position_x', 'int2')
      .addColumn('position_y', 'int2')
      .addColumn('riot_puuid_victim', 'varchar', (col) =>
        col
          .references(`${RIOT_ACCOUNTS_SNAKE_CASE}.riot_puuid`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('baron_power_play', 'int4'),
  );
};

export type GameEventRow = Selectable<GameEventsTable>;
export type InsertGameEvent = Insertable<GameEventsTable>;
export type UpdateGameEvent = Updateable<GameEventsTable>;
