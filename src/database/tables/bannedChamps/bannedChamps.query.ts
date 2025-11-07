import {
  BANNED_CHAMPS,
  LEAGUE_GAMES,
  LEAGUE_MATCHES,
} from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertBannedChamp,
  type BannedChampRow,
} from '@/database/schema.js';
import type { LeagueSide } from '@/database/shared.js';
import type { ChampionBanRecord } from '@/router/split/v1/split.dto.js';
import type { ChampionBanStatDto } from '@/router/team/v1/team.dto.js';

export class BannedChampsQuery {
  // -- INSERT

  static insert(values: InsertBannedChamp): Promise<BannedChampRow> {
    return db
      .insertInto(BANNED_CHAMPS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<BannedChampRow | undefined> {
    return db
      .selectFrom(BANNED_CHAMPS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static selectCountByTeamId(teamId: string): Promise<ChampionBanStatDto[]> {
    return db
      .selectFrom(`${BANNED_CHAMPS} as bc`)
      .where('bc.teamIdBanned', '=', teamId)
      .where('bc.champId', 'is not', null)
      .select(['bc.champId'])
      .select((eb) => eb.fn.countAll<number>().as('bans'))
      .groupBy('bc.champId')
      .orderBy('bans', 'desc')
      .execute();
  }

  static selectCountAgainstByTeamId(
    teamId: string,
  ): Promise<ChampionBanStatDto[]> {
    return db
      .selectFrom(`${BANNED_CHAMPS} as bc`)
      .where('bc.teamIdAgainst', '=', teamId)
      .where('bc.champId', 'is not', null)
      .select(['bc.champId'])
      .select((eb) => eb.fn.countAll<number>().as('bans'))
      .groupBy('bc.champId')
      .orderBy('bans', 'desc')
      .execute();
  }

  static listByGameId(gameId: string): Promise<BannedChampRow[]> {
    return db
      .selectFrom(BANNED_CHAMPS)
      .selectAll()
      .where('leagueGameId', '=', gameId)
      .orderBy('banOrder', 'asc')
      .execute();
  }

  static listChampionBansBySplitId(
    splitId: string,
  ): Promise<ChampionBanRecord[]> {
    return db
      .selectFrom(`${BANNED_CHAMPS} as bc`)
      .innerJoin(`${LEAGUE_GAMES} as g`, 'g.id', 'bc.leagueGameId')
      .innerJoin(`${LEAGUE_MATCHES} as m`, 'm.id', 'g.leagueMatchId')
      .where('m.splitId', '=', splitId)
      .select([
        'm.id as leagueMatchId',
        'g.id as leagueGameId',
        'g.gameNumber',
        'bc.sideBannedBy as side',
        'bc.champId',
        'bc.banOrder as banOrder',
      ])
      .execute();
  }

  // -- UPDATE (updateable)

  static async setTeamId(gameId: string, side: LeagueSide, teamId: string) {
    await db
      .updateTable(BANNED_CHAMPS)
      .where('leagueGameId', '=', gameId)
      .where('sideBannedBy', '=', side)
      .set({ teamIdBanned: teamId })
      .executeTakeFirstOrThrow();

    await db
      .updateTable(BANNED_CHAMPS)
      .where('leagueGameId', '=', gameId)
      .where('sideBannedBy', '!=', side)
      .set({ teamIdAgainst: teamId })
      .executeTakeFirstOrThrow();
  }

  // -- DELETE

  static deleteById(id: string): Promise<BannedChampRow | undefined> {
    return db
      .deleteFrom(BANNED_CHAMPS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
