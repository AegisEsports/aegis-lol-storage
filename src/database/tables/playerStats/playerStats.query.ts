import { sql } from 'kysely';

import {
  LEAGUE_GAMES,
  LEAGUE_MATCHES,
  PLAYER_STATS,
  RIOT_ACCOUNTS,
  TEAMS,
  USERS,
} from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertPlayerStat,
  type PlayerStatRow,
} from '@/database/schema.js';
import { RECORD_LIMIT } from '@/database/shared.js';
import type { GamePlayerStatRow } from '@/router/game/v1/game.dto.js';
import type {
  PlayerStatRecordCreepScorePerMinuteDto,
  PlayerStatRecordCsAt15Dto,
  PlayerStatRecordDamageAt15Dto,
  PlayerStatRecordDamageDealtPerMinuteDto,
  PlayerStatRecordGoldAt15Dto,
  PlayerStatRecordKillsAt15Dto,
  PlayerStatRecordVisionScorePerMinuteDto,
} from '@/router/split/v1/split.dto.js';

/**
 * Helper function to build the base query for player stat records (used in multiple places).
 */
const playerStatRecordBaseQuery = (splitId: string) => {
  return db
    .selectFrom(`${PLAYER_STATS} as ps`)
    .innerJoin(`${LEAGUE_GAMES} as g`, 'g.id', 'ps.leagueGameId')
    .innerJoin(`${LEAGUE_MATCHES} as m`, 'm.id', 'g.leagueMatchId')
    .leftJoin(`${RIOT_ACCOUNTS} as ra`, 'ra.riotPuuid', 'ps.riotPuuid')
    .leftJoin(`${USERS} as u`, 'u.id', 'ra.userId')
    .leftJoin(`${TEAMS} as tb`, 'tb.id', 'g.blueTeamId')
    .leftJoin(`${TEAMS} as tr`, 'tr.id', 'g.redTeamId')
    .where('m.splitId', '=', splitId)
    .where((eb) => eb('g.invalidated', '=', eb.val(false)))
    .select((eb) => [
      'ps.leagueGameId',
      'u.username',
      'ps.riotPuuid',
      'ps.riotIgn',
      'ps.playerRole as role',
      'ps.champId',
      'ps.champName',
      // team/opponent by side
      sql<string | null>`
          CASE WHEN ${eb.ref('ps.side')} = 'Blue' THEN ${eb.ref('tb.name')} ELSE ${eb.ref('tr.name')} END
        `.as('teamName'),
      sql<string | null>`
          CASE WHEN ${eb.ref('ps.side')} = 'Blue' THEN ${eb.ref('tr.name')} ELSE ${eb.ref('tb.name')} END
        `.as('opposingTeamName'),
    ]);
};

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

  // For PlayerStatRecord
  static listCreepScorePerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordCreepScorePerMinuteDto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select(['ps.creepScorePerMinute', 'ps.creepScore'])
      .orderBy('ps.creepScorePerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listDamageDealtPerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordDamageDealtPerMinuteDto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select([
        'ps.damageDealtPerMinute',
        'ps.totalDamageToChamps as damageDealt',
      ])
      .orderBy('ps.damageDealtPerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listVisionScorePerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordVisionScorePerMinuteDto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select(['ps.visionScorePerMinute', 'ps.visionScore'])
      .orderBy('ps.visionScorePerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute() as Promise<PlayerStatRecordVisionScorePerMinuteDto[]>;
  }

  static listKillsAt15RecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordKillsAt15Dto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select('ps.killsAt15')
      .orderBy('ps.killsAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute() as Promise<PlayerStatRecordKillsAt15Dto[]>;
  }

  static listDamageAt15RecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordDamageAt15Dto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select(['ps.damageAt15', 'ps.damageDiff15'])
      .orderBy('ps.damageAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute() as Promise<PlayerStatRecordDamageAt15Dto[]>;
  }

  static listGoldAt15RecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordGoldAt15Dto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select(['ps.goldAt15', 'ps.goldDiff15'])
      .orderBy('ps.goldAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute() as Promise<PlayerStatRecordGoldAt15Dto[]>;
  }

  static listCsAt15RecordsBySplitId(
    splitId: string,
  ): Promise<PlayerStatRecordCsAt15Dto[]> {
    return playerStatRecordBaseQuery(splitId)
      .select(['ps.csAt15', 'ps.csDiff15'])
      .orderBy('ps.csAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute() as Promise<PlayerStatRecordCsAt15Dto[]>;
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
