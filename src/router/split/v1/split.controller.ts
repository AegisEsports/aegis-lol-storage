import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { db } from '@/database/database.js';
import { SplitService } from '@/router/split/v1/split.service.js';
import type {
  CreateSplitBody,
  UpdateSplitBody,
} from '@/router/split/v1/split.zod.js';

export class SplitController {
  private split: SplitService = new SplitService(db);

  /**
   * POST - /
   */
  public createSplit: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { split } = req.body as CreateSplitBody;

      res.status(201).json(await this.split.create(split));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /{splitId}
   */
  public readSplit: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { splitId } = req.params;

      res.status(200).json(await this.split.findById(splitId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /players/{splitId}
   */
  public readSplitPlayerStats: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { splitId } = req.params;

      res.status(200).json(await this.split.findPlayerStatsBySplitId(splitId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /teams/{splitId}
   */
  public readTeamPlayerStats: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { splitId } = req.params;

      res.status(200).json(await this.split.findTeamStatsBySplitId(splitId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /games/{splitId}
   */
  public readSplitGames: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { splitId } = req.params;

      res.status(200).json(await this.split.findGamesBySplitId(splitId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /champs/{splitId}
   */
  public readSplitChampionStats: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { splitId } = req.params;

      res
        .status(200)
        .json(await this.split.findChampionStatsBySplitId(splitId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /{splitId}
   */
  public updateSplit: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { splitId } = req.params;
      const { split } = req.body as UpdateSplitBody;

      res.status(200).json(await this.split.replaceById(splitId!, split));
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE - /{splitId}
   */
  public deleteSplit: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { splitId } = req.params;

      res.status(200).json(await this.split.removeById(splitId!));
    } catch (err) {
      next(err);
    }
  };
}
