import { sql } from 'kysely';

import {
  LEAGUE_GAMES,
  LEAGUE_MATCHES,
  TEAM_STATS,
  TEAMS,
} from '@/database/const.js';
import { db } from '@/database/database.js';
import { type InsertTeamStat, type TeamStatRow } from '@/database/schema.js';
import { RECORD_LIMIT } from '@/database/shared.js';
import type { LeagueSide } from '@/database/shared.js';
import type { GameTeamStatRow } from '@/router/game/v1/game.dto.js';
import type {
  TeamStatRecordDamageAt15Dto,
  TeamStatRecordFirstBloodTimestampDto,
  TeamStatRecordFirstInhibitorTimestampDto,
  TeamStatRecordFirstTowerTimestampDto,
  TeamStatRecordGoldAt15Dto,
  TeamStatRecordKillsAt15Dto,
  TeamStatRecordWardsClearedAt15Dto,
  TeamStatRecordWardsPlacedAt15Dto,
} from '@/router/split/v1/split.dto.js';

/**
 * Helper function to build the base query for team stat records (used in multiple places).
 */
const teamStatRecordBaseQuery = (splitId: string) => {
  return db
    .selectFrom(`${TEAM_STATS} as ts`)
    .innerJoin(`${LEAGUE_GAMES} as g`, 'g.id', 'ts.leagueGameId')
    .innerJoin(`${LEAGUE_MATCHES} as m`, 'm.id', 'g.leagueMatchId')
    .leftJoin(`${TEAMS} as t`, 't.id', 'ts.teamId') // this team
    .leftJoin(`${TEAMS} as tb`, 'tb.id', 'g.blueTeamId') // blue side in game
    .leftJoin(`${TEAMS} as tr`, 'tr.id', 'g.redTeamId') // red side in game
    .where('m.splitId', '=', splitId)
    .where((eb) => eb('g.invalidated', '=', eb.val(false)))
    .select((eb) => [
      'ts.leagueGameId',
      't.name as teamName',
      // opponent name from side
      sql<string>`
        CASE 
          WHEN ${eb.ref('ts.side')} = 'Blue' THEN ${eb.ref('tr.name')}
          ELSE ${eb.ref('tb.name')}
        END
      `.as('opposingTeamName'),
    ]);
};

export class TeamStatsQuery {
  // -- INSERT

  static insert(values: InsertTeamStat): Promise<TeamStatRow> {
    return db
      .insertInto(TEAM_STATS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<TeamStatRow | undefined> {
    return db
      .selectFrom(TEAM_STATS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByGameId(gameId: string): Promise<GameTeamStatRow[]> {
    return db
      .selectFrom(`${TEAM_STATS} as ts`)
      .innerJoin(`${TEAMS} as t`, 't.id', 'ts.teamId')
      .selectAll('ts')
      .select('t.name as teamName')
      .where('ts.leagueGameId', '=', gameId)
      .orderBy('side', 'asc')
      .execute();
  }

  // For TeamStatRecords

  static listFirstTowerTimestampRecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordFirstTowerTimestampDto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select('ts.firstTowerTimestamp')
      .orderBy('ts.firstTowerTimestamp', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listFirstBloodTimestampRecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordFirstBloodTimestampDto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select('ts.firstBloodTimestamp')
      .orderBy('ts.firstBloodTimestamp', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listFirstInhibitorTimestampRecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordFirstInhibitorTimestampDto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select('ts.firstInhibitorTimestamp')
      .orderBy('ts.firstInhibitorTimestamp', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listKillsAt15RecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordKillsAt15Dto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select(['ts.killsAt15', 'ts.killsDiff15'])
      .orderBy('ts.killsAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listGoldAt15RecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordGoldAt15Dto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select(['ts.goldAt15', 'ts.goldDiff15'])
      .orderBy('ts.goldAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listDamageAt15RecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordDamageAt15Dto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select(['ts.damageAt15', 'ts.damageDiff15'])
      .orderBy('ts.damageAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listWardsPlacedAt15RecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordWardsPlacedAt15Dto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select(['ts.wardsPlacedAt15', 'ts.wardsPlacedDiff15'])
      .orderBy('ts.wardsPlacedAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listWardsClearedAt15RecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordWardsClearedAt15Dto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select(['ts.wardsClearedAt15', 'ts.wardsClearedDiff15'])
      .orderBy('ts.wardsClearedAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  // -- UPDATE (not replaceable)

  static setTeamId(
    gameId: string,
    side: LeagueSide,
    teamId: string,
  ): Promise<TeamStatRow | undefined> {
    return db
      .updateTable(TEAM_STATS)
      .set({ teamId })
      .where('side', '=', side)
      .where('leagueGameId', '=', gameId)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(id: string): Promise<TeamStatRow | undefined> {
    return db
      .deleteFrom(TEAM_STATS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
