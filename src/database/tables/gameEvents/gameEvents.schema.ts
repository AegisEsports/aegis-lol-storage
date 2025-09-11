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
  TEAMS_SNAKE_CASE,
  USERS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  createTableWithBase,
  type TableBase,
  EVENT_TYPES,
  LEAGUE_LANES,
} from '@/database/shared.js';

export const gameEventRowSchema = z.strictObject({
  leagueGameId: z.uuid(),
  teamId: z.uuid().nullable(),
  eventType: z.enum(EVENT_TYPES).nullable(),
  gameTimestamp: z.coerce.number().int().nullable(),
  lane: z.enum(LEAGUE_LANES).nullable(),
  killerId: z.uuid().nullable(),
  victimId: z.uuid().nullable(),
  baronPowerPlay: z.coerce.number().int().nullable(),
});

type GameEventFields = z.infer<typeof gameEventRowSchema>;

export interface GameEventsTable extends GameEventFields, TableBase {}

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
      .addColumn('team_id', 'uuid', (col) =>
        col
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('event_type', 'varchar')
      .addColumn('game_timestamp', 'int2')
      .addColumn('lane', 'varchar')
      .addColumn('killer_id', 'uuid', (col) =>
        col
          .references(`${USERS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('victim_id', 'uuid', (col) =>
        col
          .references(`${USERS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('baron_power_play', 'int4'),
  );
};

export type GameEventRow = Selectable<GameEventsTable>;
export type InsertGameEvent = Insertable<GameEventsTable>;
export type UpdateGameEvent = Updateable<GameEventsTable>;
