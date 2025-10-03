import { PLAYER_STATS, RIOT_ACCOUNTS, USERS } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertPlayerStat,
  type PlayerStatRow,
} from '@/database/schema.js';
import type { GamePlayerStatRow } from '@/router/game/v1/game.dto.js';

export class PlayerStatsQuery {
  // -- INSERT

  static insert(values: InsertPlayerStat): Promise<PlayerStatRow> {
    return db
      .insertInto(PLAYER_STATS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<PlayerStatRow | undefined> {
    return db
      .selectFrom(PLAYER_STATS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByGameId(gameId: string): Promise<GamePlayerStatRow[]> {
    return db
      .selectFrom(`${PLAYER_STATS} as ps`)
      .innerJoin(`${RIOT_ACCOUNTS} as ra`, 'ra.riotPuuid', 'ps.riotPuuid')
      .innerJoin(`${USERS} as u`, 'u.id', 'ra.userId')
      .selectAll('ps')
      .select('u.username as username')
      .where('ps.leagueGameId', '=', gameId)
      .execute();
  }

  // -- UPDATE (not updateable)

  // -- DELETE

  static deleteById(id: string): Promise<PlayerStatRow | undefined> {
    return db
      .deleteFrom(PLAYER_STATS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
