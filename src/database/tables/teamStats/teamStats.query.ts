import { TEAM_STATS } from '@/database/const.js';
import { db } from '@/database/database.js';
import { type InsertTeamStat, type TeamStatRow } from '@/database/schema.js';
import type { LeagueSide } from '@/database/shared.js';

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
