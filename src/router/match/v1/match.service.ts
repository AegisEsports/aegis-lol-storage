import type { Kysely } from 'kysely';

import type { Database } from '@/database/database.js';
import {
  BannedChampsQuery,
  LeagueGamesQuery,
  // LeagueGamesQuery,
  LeagueMatchesQuery,
  PlayerStatsQuery,
  TeamsQuery,
  TeamStatsQuery,
} from '@/database/query.js';
import type {
  InsertLeagueMatch,
  LeagueGameRow,
  LeagueMatchRow,
  UpdateLeagueMatch,
} from '@/database/schema.js';
import { MATCH_SIDES } from '@/database/shared.js';
import type {
  MatchDto,
  MatchGameDto,
  // MatchGameDto,
  MatchTableDto,
} from '@/router/match/v1/match.dto.js';
import ControllerError from '@/util/errors/controllerError.js';

export class MatchService {
  constructor(private db: Kysely<Database>) {}

  private getTeamNamesFromMatch = async (match: LeagueMatchRow) => {
    const homeTeam = match.homeTeamId
      ? await TeamsQuery.selectById(this.db, match.homeTeamId)
      : null;
    const awayTeam = match.awayTeamId
      ? await TeamsQuery.selectById(this.db, match.awayTeamId)
      : null;
    return {
      homeTeamName: homeTeam ? homeTeam.name : null,
      awayTeamName: awayTeam ? awayTeam.name : null,
    };
  };

  private getTeamNamesFromGame = async (match: LeagueGameRow) => {
    const blueTeam = match.blueTeamId
      ? await TeamsQuery.selectById(this.db, match.blueTeamId)
      : null;
    const redTeam = match.redTeamId
      ? await TeamsQuery.selectById(this.db, match.redTeamId)
      : null;
    return {
      blueTeamName: blueTeam ? blueTeam.name : null,
      redTeamName: redTeam ? redTeam.name : null,
    };
  };

  /**
   * Creates a singular entry of a match.
   */
  public create = async (matchData: InsertLeagueMatch): Promise<MatchDto> => {
    const insertedMatch = await LeagueMatchesQuery.insert(this.db, matchData);
    const { homeTeamName, awayTeamName } =
      await this.getTeamNamesFromMatch(insertedMatch);

    return {
      match: {
        ...insertedMatch,
        homeTeamName,
        awayTeamName,
      },
      games: [],
    };
  };

  /**
   * Retrieves a singular entry of a match.
   */
  public findById = async (matchId: string): Promise<MatchDto> => {
    const getMatch = await LeagueMatchesQuery.selectById(this.db, matchId);
    if (!getMatch) {
      throw new ControllerError(404, 'NotFound', 'Match not found', {
        matchId,
      });
    }
    const { homeTeamName, awayTeamName } =
      await this.getTeamNamesFromMatch(getMatch);
    const getGames = await LeagueGamesQuery.listByMatchId(this.db, getMatch.id);
    const games: MatchGameDto[] = await Promise.all(
      getGames.map(async (game) => {
        const { blueTeamName, redTeamName } =
          await this.getTeamNamesFromGame(game);
        const blueTeamStats = await TeamStatsQuery.selectByGameAndSide(
          this.db,
          game.id,
          'Blue',
        );
        const redTeamStats = await TeamStatsQuery.selectByGameAndSide(
          this.db,
          game.id,
          'Red',
        );
        const bannedChampRows = await BannedChampsQuery.listByGameId(
          this.db,
          game.id,
        );
        return {
          leagueGameId: game.id,
          gameNumber: game.gameNumber,
          blueTeam: {
            teamId: game.blueTeamId,
            teamName: blueTeamName,
            champBanIds: bannedChampRows
              .filter((r) => r.sideBannedBy === 'Blue')
              .map((r) => r.champId)
              .filter((id) => id),
            champPickIds: await PlayerStatsQuery.listChampIdsByGameAndSide(
              this.db,
              game.id,
              'Blue',
            ),
            gold: blueTeamStats.totalGold!,
            kills: blueTeamStats.totalKills!,
            towers: blueTeamStats.totalTowers!,
            dragons: blueTeamStats.totalDragons!,
          },
          redTeam: {
            teamId: game.redTeamId,
            teamName: redTeamName,
            champBanIds: bannedChampRows
              .filter((r) => r.sideBannedBy === 'Red')
              .map((r) => r.champId)
              .filter((id) => id),
            champPickIds: await PlayerStatsQuery.listChampIdsByGameAndSide(
              this.db,
              game.id,
              'Red',
            ),
            gold: redTeamStats.totalGold!,
            kills: redTeamStats.totalKills!,
            towers: redTeamStats.totalTowers!,
            dragons: redTeamStats.totalDragons!,
          },
          sideWin: game.sideWin,
          duration: game.duration,
        };
      }),
    );

    return {
      match: {
        ...getMatch,
        homeTeamName,
        awayTeamName,
      },
      games,
    };
  };

  /**
   * Updates a singular entry of a match.
   */
  public replaceById = async (
    matchId: string,
    matchData: UpdateLeagueMatch,
  ): Promise<MatchTableDto> => {
    const updatedMatch = await LeagueMatchesQuery.updateById(
      this.db,
      matchId,
      matchData,
    );
    if (!updatedMatch) {
      throw new ControllerError(404, 'NotFound', 'Match not found', {
        matchId,
      });
    }

    return {
      match: updatedMatch,
    };
  };

  /**
   * Assigns a team based on either 'away' (left) or 'home' (right).
   */
  public updateTeamInMatch = async (
    matchId: string,
    side: string,
    teamId: string,
  ): Promise<MatchTableDto> => {
    let patchedMatch = null;
    if (side === MATCH_SIDES[0].toLowerCase()) {
      // Away
      patchedMatch = await LeagueMatchesQuery.setAwayTeamId(
        this.db,
        matchId,
        teamId,
      );
    } else {
      // Home
      patchedMatch = await LeagueMatchesQuery.setHomeTeamId(
        this.db,
        matchId,
        teamId,
      );
    }
    if (!patchedMatch) {
      throw new ControllerError(404, 'NotFound', 'Match not found', {
        matchId,
        teamId,
      });
    }

    return {
      match: patchedMatch,
    };
  };

  /**
   * Deletes a singular entry of a match.
   */
  public removeById = async (matchId: string): Promise<MatchTableDto> => {
    const deletedMatch = await LeagueMatchesQuery.deleteById(this.db, matchId);
    if (!deletedMatch) {
      throw new ControllerError(404, 'NotFound', 'Match not found', {
        matchId,
      });
    }

    return {
      match: deletedMatch,
    };
  };
}
