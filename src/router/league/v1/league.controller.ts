import type { NextFunction, Request, Response } from 'express';

import { LeagueService } from '@/router/league/v1/league.service.js';
import type {
  CreateLeagueBanBody,
  CreateLeagueBody,
  UpdateLeagueBanBody,
  UpdateLeagueBody,
} from '@/router/league/v1/league.zod.js';

export const LeagueController = {
  /**
   * POST - /
   */
  createLeague: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { league } = req.body as CreateLeagueBody;

      res.status(201).json(await LeagueService.create(league));
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST - /league-ban
   */
  createLeagueBan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leagueBan } = req.body as CreateLeagueBanBody;

      res.status(201).json(await LeagueService.createLeagueBan(leagueBan));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET - /{leagueId}
   */
  readLeague: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leagueId } = req.params as { leagueId: string };

      res.status(200).json(await LeagueService.findById(leagueId!));
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT - /{leagueId}
   */
  updateLeague: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leagueId } = req.params;
      const { league } = req.body as UpdateLeagueBody;

      res.status(200).json(await LeagueService.replaceById(leagueId!, league));
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT - /league-ban/{leagueBanId}
   */
  updateLeagueBan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { leagueBanId } = req.params;
      const { leagueBan } = req.body as UpdateLeagueBanBody;

      res
        .status(200)
        .json(
          await LeagueService.replaceLeagueBanById(leagueBanId!, leagueBan),
        );
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

      res
        .status(200)
        .json(await LeagueService.removeLeagueBanById(leagueBanId!));
    } catch (err) {
      next(err);
    }
  },
};
