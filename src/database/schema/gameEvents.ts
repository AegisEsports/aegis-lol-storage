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
import type { LeagueLane, EventType } from './shared/types.js';
import { TEAMS } from './teams.js';
import { USERS } from './users.js';

export interface GameEventsTable extends TableBase {
  leagueGameId: string;
  teamId: string | null;
  eventType: EventType | null;
  gameTimestamp: number | null;
  lane: LeagueLane | null;
  killerId: string | null;
  victimId: string | null;
  baronPowerPlay: number | null;
}

export const GAME_EVENTS = 'gameEvents';
export const GAME_EVENTS_SNAKE_CASE = 'game_events';

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
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('event_type', 'varchar')
      .addColumn('game_timestamp', 'int2')
      .addColumn('lane', 'varchar')
      .addColumn('killer_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('victim_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('baron_power_play', 'int4'),
  );
};

export type GameEventRow = Selectable<GameEventsTable>;
export type InsertGameEvent = Insertable<GameEventsTable>;
export type UpdateGameEvent = Updateable<GameEventsTable>;
