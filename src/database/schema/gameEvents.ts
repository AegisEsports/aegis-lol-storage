import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import { LEAGUE_GAMES } from './leagueGames.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import type { LeagueLane, EventType } from './shared/types.js';
import { TEAMS } from './teams.js';
import { USERS } from './users.js';

export interface GameEventsTable extends TableBase {
  league_game_id: string | null;
  team_id: string | null;
  event_type: EventType | null;
  game_timestamp: number | null;
  lane: LeagueLane | null;
  killer_id: string | null;
  victim_id: string | null;
  baron_power_play: number | null;
}

export const GAME_EVENTS = 'game_events';

export const createGameEventsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, GAME_EVENTS, (t) =>
    t
      .addColumn('league_game_id', 'uuid', (col) =>
        col
          .references(`${LEAGUE_GAMES}.id`)
          .onDelete('set null')
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

export type GameEvent = Selectable<GameEventsTable>;
export type NewGameEvent = Insertable<GameEventsTable>;
export type UpdateGameEvent = Updateable<GameEventsTable>;
