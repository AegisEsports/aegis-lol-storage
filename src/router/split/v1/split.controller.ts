import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { SplitService } from '@/router/split/v1/split.service.js';
import type {
  CreateSplitBody,
  UpdateSplitBody,
} from '@/router/split/v1/split.zod.js';

export class SplitController {
  /**
   * POST - /
   */
  public static createSplit: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { split } = req.body as CreateSplitBody;

      res.status(201).json(await SplitService.create(split));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /{splitId}
   */
  public static readSplit: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { splitId } = req.params;

      res.status(200).json(await SplitService.findById(splitId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /{splitId}
   */
  public static updateSplit: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { splitId } = req.params;
      const { split } = req.body as UpdateSplitBody;

      res.status(200).json(await SplitService.replaceById(splitId!, split));
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE - /{splitId}
   */
  public static deleteSplit: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { splitId } = req.params;

      res.status(200).json(await SplitService.removeById(splitId!));
    } catch (err) {
      next(err);
    }
  };
}
