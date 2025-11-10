import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { db } from '@/database/database.js';
import { LeagueService } from '@/router/league/v1/league.service.js';
import type {
  CreateLeagueBanBody,
  CreateLeagueBody,
  UpdateLeagueBanBody,
  UpdateLeagueBody,
} from '@/router/league/v1/league.zod.js';

export class LeagueController {
  private league: LeagueService = new LeagueService(db);

  /**
   * POST - /
   */
  public createLeague: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { league } = req.body as CreateLeagueBody;

      res.status(201).json(await this.league.create(league));
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST - /league-ban
   */
  public createLeagueBan: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { leagueBan } = req.body as CreateLeagueBanBody;

      res.status(201).json(await this.league.createLeagueBan(leagueBan));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /{leagueId}
   */
  public readLeague: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { leagueId } = req.params as { leagueId: string };

      res.status(200).json(await this.league.findById(leagueId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /{leagueId}
   */
  public updateLeague: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { leagueId } = req.params;
      const { league } = req.body as UpdateLeagueBody;

      res.status(200).json(await this.league.replaceById(leagueId!, league));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /league-ban/{leagueBanId}
   */
  public updateLeagueBan: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { leagueBanId } = req.params;
      const { leagueBan } = req.body as UpdateLeagueBanBody;

      res
        .status(200)
        .json(await this.league.replaceLeagueBanById(leagueBanId!, leagueBan));
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE - /{leagueId}
   *
   * Deletes a singular entry of a league. This is currently not used.
   */
  public deleteLeague: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.status(501).json();
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE - /league-bans/{leagueBanId}
   *
   * Deletes a singular entry of a league ban - effectively unbanning someone.
   */
  public deleteLeagueBan: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { leagueBanId } = req.params;

      res.status(200).json(await this.league.removeLeagueBanById(leagueBanId!));
    } catch (err) {
      next(err);
    }
  };
}
