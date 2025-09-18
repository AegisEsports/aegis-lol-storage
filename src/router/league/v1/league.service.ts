import {
  LeagueBansQuery,
  LeaguesQuery,
  SplitsQuery,
} from '@/database/query.js';
import type {
  InsertLeague,
  InsertLeagueBan,
  UpdateLeague,
  UpdateLeagueBan,
} from '@/database/schema.js';
import type {
  LeagueBanDto,
  LeagueDto,
  LeagueTableDto,
} from '@/router/league/v1/league.dto.js';
import ControllerError from '@/util/errors/controllerError.js';

export class LeagueService {
  /**
   * Creates a singular entry of a league.
   */
  public static create = async (
    leagueData: InsertLeague,
  ): Promise<LeagueDto> => {
    const insertedLeague = await LeaguesQuery.insert(leagueData);

    return {
      league: insertedLeague,
      splits: [],
      usersBanned: [],
    };
  };

  /**
   * Creates a singular entry of a user banned from a league (due to a competitive ruling).
   */
  public static createLeagueBan = async (
    leagueBanData: InsertLeagueBan,
  ): Promise<LeagueBanDto> => {
    const insertedLeagueBan = await LeagueBansQuery.insert(leagueBanData);

    return {
      leagueBan: insertedLeagueBan,
    };
  };

  /**
   * Retrieves a singular entry of a league.
   */
  public static findById = async (leagueId: string): Promise<LeagueDto> => {
    const getLeague = await LeaguesQuery.selectById(leagueId);
    if (!getLeague) {
      throw new ControllerError(404, 'NotFound', 'League not found', {
        leagueId,
      });
    }
    const getSplits = await SplitsQuery.listByLeagueId(leagueId);
    const getUsersBanned = await LeagueBansQuery.listByLeagueId(leagueId);

    return {
      league: getLeague,
      splits: getSplits,
      usersBanned: getUsersBanned,
    };
  };

  /**
   * Updates a singular entry of a league.
   */
  public static replaceById = async (
    leagueId: string,
    leagueData: UpdateLeague,
  ): Promise<LeagueTableDto> => {
    const updatedLeague = await LeaguesQuery.updateById(leagueId!, leagueData);
    if (!updatedLeague) {
      throw new ControllerError(404, 'NotFound', 'League not found', {
        leagueId,
      });
    }

    return {
      league: updatedLeague,
    };
  };

  /**
   * Updates a singular entry of a league ban.
   */
  public static replaceLeagueBanById = async (
    leagueBanId: string,
    leagueBanData: UpdateLeagueBan,
  ): Promise<LeagueBanDto> => {
    const updatedLeagueBan = await LeagueBansQuery.updateById(
      leagueBanId!,
      leagueBanData,
    );
    if (!updatedLeagueBan) {
      throw new ControllerError(404, 'NotFound', 'League ban not found', {
        leagueBanId,
      });
    }

    return {
      leagueBan: updatedLeagueBan,
    };
  };

  /**
   * Deletes a singular entry of a league.
   */
  public static removeLeagueBanById = async (
    leagueBanId: string,
  ): Promise<LeagueBanDto> => {
    const deletedLeagueBan = await LeagueBansQuery.deleteById(leagueBanId);
    if (!deletedLeagueBan) {
      throw new ControllerError(404, 'NotFound', 'League ban not found', {
        leagueBanId,
      });
    }

    return {
      leagueBan: deletedLeagueBan,
    };
  };
}
