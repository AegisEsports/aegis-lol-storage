import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { MatchService } from '@/router/match/v1/match.service.js';
import type {
  CreateMatchBody,
  UpdateMatchBody,
} from '@/router/match/v1/match.zod.js';

export class MatchController {
  /**
   * POST - /
   */
  public static createMatch: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { match } = req.body as CreateMatchBody;

      res.status(201).json(await MatchService.create(match));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /{matchId}
   */
  public static readMatch: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { matchId } = req.params;

      res.status(200).json(await MatchService.findById(matchId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /{matchId}
   */
  public static updateMatch: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { matchId } = req.params;
      const { match } = req.body as UpdateMatchBody;

      res.status(200).json(await MatchService.replaceById(matchId!, match));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /{matchId}/{side}/{teamId}
   */
  public static assignTeamToMatch: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { matchId, side, teamId } = req.params;

      res
        .status(200)
        .json(await MatchService.updateTeamInMatch(matchId!, side!, teamId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE - /{matchId}
   */
  public static deleteMatch: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { matchId } = req.params;

      res.status(200).json(await MatchService.removeById(matchId!));
    } catch (err) {
      next(err);
    }
  };
}
