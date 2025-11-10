import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { db } from '@/database/database.js';
import { MatchService } from '@/router/match/v1/match.service.js';
import type {
  CreateMatchBody,
  UpdateMatchBody,
} from '@/router/match/v1/match.zod.js';

export class MatchController {
  private match: MatchService = new MatchService(db);

  /**
   * POST - /
   */
  public createMatch: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { match } = req.body as CreateMatchBody;

      res.status(201).json(await this.match.create(match));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /{matchId}
   */
  public readMatch: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { matchId } = req.params;

      res.status(200).json(await this.match.findById(matchId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /{matchId}
   */
  public updateMatch: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { matchId } = req.params;
      const { match } = req.body as UpdateMatchBody;

      res.status(200).json(await this.match.replaceById(matchId!, match));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /{matchId}/{side}/{teamId}
   */
  public assignTeamToMatch: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { matchId, side, teamId } = req.params;

      res
        .status(200)
        .json(await this.match.updateTeamInMatch(matchId!, side!, teamId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE - /{matchId}
   */
  public deleteMatch: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { matchId } = req.params;

      res.status(200).json(await this.match.removeById(matchId!));
    } catch (err) {
      next(err);
    }
  };
}
