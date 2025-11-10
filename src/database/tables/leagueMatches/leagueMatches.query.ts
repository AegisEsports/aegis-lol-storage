import { sql } from 'kysely';

import { LEAGUE_MATCHES, TEAMS } from '@/database/const.js';
import {
  type InsertLeagueMatch,
  type LeagueMatchRow,
  type UpdateLeagueMatch,
} from '@/database/schema.js';
import type { DbType } from '@/database/types.js';
import type { TeamMatchPlayedInDto } from '@/router/team/v1/team.dto.js';

export class LeagueMatchesQuery {
  // -- INSERT

  static insert(
    db: DbType,
    values: InsertLeagueMatch,
  ): Promise<LeagueMatchRow> {
    return db
      .insertInto(LEAGUE_MATCHES)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: DbType,
    id: string,
  ): Promise<LeagueMatchRow | undefined> {
    return db
      .selectFrom(LEAGUE_MATCHES)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  /**
   * List all league matches a team has played in.
   * Intentionally leaving out nested games/players; handled in service layer.
   */
  static async listByTeamId(
    db: DbType,
    teamId: string,
  ): Promise<TeamMatchPlayedInDto[]> {
    const rows = await db
      .selectFrom(`${LEAGUE_MATCHES} as m`)
      // join home/away teams so we can pick the opponent's name
      .leftJoin(`${TEAMS} as th`, 'th.id', 'm.homeTeamId')
      .leftJoin(`${TEAMS} as ta`, 'ta.id', 'm.awayTeamId')
      .where((eb) =>
        eb.or([
          eb('m.homeTeamId', '=', teamId),
          eb('m.awayTeamId', '=', teamId),
        ]),
      )
      .select((eb) => [
        // LeagueMatchRow fields (alias where names differ)
        'm.id',
        'm.createdAt',
        'm.modifiedAt',
        'm.splitId',
        'm.awayTeamId',
        'm.homeTeamId',
        'm.awayScore',
        'm.homeScore',
        'm.bestOf',
        'm.matchType',
        'm.weekNumber',
        'm.scheduledAt',

        // Determine sideWin field
        sql<'Away' | 'Home' | null>`
          case
            when ${eb.ref('m.awayScore')} > ${eb.ref('m.homeScore')} then 'Away'
            when ${eb.ref('m.homeScore')} > ${eb.ref('m.awayScore')} then 'Home'
            else null
          end
        `.as('sideWin'),

        // opposingTeamName: if we’re home, opponent is away; else home
        eb
          .case()
          .when('m.homeTeamId', '=', teamId)
          .then(eb.ref('ta.name'))
          .else(eb.ref('th.name'))
          .end()
          .as('opposingTeamName'),
      ])
      .orderBy('m.scheduledAt', 'desc')
      .execute();

    return rows.map((r) => ({
      ...r,
      games: [],
    }));
  }

  // -- UPDATE

  static updateById(
    db: DbType,
    id: string,
    update: UpdateLeagueMatch,
  ): Promise<LeagueMatchRow | undefined> {
    return db
      .updateTable(LEAGUE_MATCHES)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  static setHomeTeamId(
    db: DbType,
    matchId: string,
    teamId: string,
  ): Promise<LeagueMatchRow | undefined> {
    return db
      .updateTable(LEAGUE_MATCHES)
      .set({ homeTeamId: teamId })
      .where('id', '=', matchId)
      .returningAll()
      .executeTakeFirst();
  }

  static setAwayTeamId(
    db: DbType,
    matchId: string,
    teamId: string,
  ): Promise<LeagueMatchRow | undefined> {
    return db
      .updateTable(LEAGUE_MATCHES)
      .set({ awayTeamId: teamId })
      .where('id', '=', matchId)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(
    db: DbType,
    id: string,
  ): Promise<LeagueMatchRow | undefined> {
    return db
      .deleteFrom(LEAGUE_MATCHES)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
