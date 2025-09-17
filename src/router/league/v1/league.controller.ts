import type { NextFunction, Request, Response } from 'express';

import {
  LeagueBansQuery,
  LeaguesQuery,
  SplitsQuery,
} from '@/database/query.js';
import type { UpdateLeague, UpdateLeagueBan } from '@/database/schema.js';
import type { LeagueBanDto, LeagueDto } from '@/router/league/v1/league.dto.js';
import type {
  CreateLeagueBanBody,
  CreateLeagueBody,
  UpdateLeagueBanBody,
  UpdateLeagueBody,
} from '@/router/league/v1/league.zod.js';
import ControllerError from '@/util/errors/controllerError.js';

export const LeagueController = {
  /**
   * POST - /
   *
   * Creates a singular entry of a league.
   */
  createLeague: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        league: { name, riotProviderId },
      } = req.body as CreateLeagueBody;
      const insertedLeague = await LeaguesQuery.insert({
        name,
        riotProviderId,
      });

      const dto: LeagueDto = {
        league: insertedLeague,
        splits: [],
        usersBanned: [],
      };
      res.status(201).json(dto);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST - /league-ban
   *
   * Creates a singular entry of a user banned from a league (due to a competitive ruling).
   */
  createLeagueBan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        leagueBan: { leagueId, teamIdBanned, userIdBanned, bannedDate },
      } = req.body as CreateLeagueBanBody;
      const insertedLeagueBan = await LeagueBansQuery.insert({
        leagueId,
        teamIdBanned,
        userIdBanned,
        bannedDate,
      });

      const dto: LeagueBanDto = {
        leagueBan: insertedLeagueBan,
      };
      res.status(201).json(dto);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET - /{leagueId}
   *
   * Retrieves a singular entry of a league, its splits, and users banned in the league.
   */
  readLeague: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leagueId } = req.params as { leagueId: string };
      const getLeague = await LeaguesQuery.selectById(leagueId);
      if (!getLeague) {
        throw new ControllerError(404, 'NotFound', 'League not found', {
          leagueId,
        });
      }
      const getSplits = await SplitsQuery.listByLeagueId(leagueId);
      const getUsersBanned = await LeagueBansQuery.listByLeagueId(leagueId);

      const dto: LeagueDto = {
        league: getLeague,
        splits: getSplits,
        usersBanned: getUsersBanned,
      };
      res.status(200).json(dto);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT - /{leagueId}
   *
   * Updates a singular entry of a league.
   */
  updateLeague: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leagueId } = req.params;
      const { league } = req.body as UpdateLeagueBody;
      const updatedLeague = await LeaguesQuery.updateById(
        leagueId!,
        league satisfies UpdateLeague,
      );
      if (!updatedLeague) {
        throw new ControllerError(404, 'NotFound', 'League not found', {
          leagueId,
        });
      }

      res.status(200).json(updatedLeague);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT - /league-ban/{leagueBanId}
   *
   * Updates a singular entry of a league ban.
   */
  updateLeagueBan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leagueBanId } = req.params;
      const { leagueBan } = req.body as UpdateLeagueBanBody;
      const updatedLeagueBan = await LeagueBansQuery.updateById(
        leagueBanId!,
        leagueBan satisfies UpdateLeagueBan,
      );
      if (!updatedLeagueBan) {
        throw new ControllerError(404, 'NotFound', 'League ban not found', {
          leagueBanId,
        });
      }

      res.status(200).json(updatedLeagueBan);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE - /{leagueId}
   *
   * Deletes a singular entry of a league. This is currently not used.
   */
  deleteLeague: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(501).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE - /league-bans/{leagueBanId}
   *
   * Deletes a singular entry of a league ban - effectively unbanning someone.
   */
  deleteLeagueBan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leagueBanId } = req.params;
      const deletedLeagueBan = await LeagueBansQuery.deleteById(leagueBanId!);

      res.status(200).json(deletedLeagueBan);
    } catch (err) {
      next(err);
    }
  },
};
