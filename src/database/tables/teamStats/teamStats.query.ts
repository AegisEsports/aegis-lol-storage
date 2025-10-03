import { TEAM_STATS, TEAMS } from '@/database/const.js';
import { db } from '@/database/database.js';
import { type InsertTeamStat, type TeamStatRow } from '@/database/schema.js';
import type { LeagueSide } from '@/database/shared.js';
import type { GameTeamStatRow } from '@/router/game/v1/game.dto.js';

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
