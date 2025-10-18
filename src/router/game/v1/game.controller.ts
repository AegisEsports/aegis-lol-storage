import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { GameService } from './game.service.js';
import type { CreateGameBody, PatchGameDraftLinkBody } from './game.zod.js';

export class GameController {
  /**
   * POST - /
   */
  public static createGame: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { leagueMatchId, blueTeamId, redTeamId, riotMatchId, draftLink } =
        req.body as CreateGameBody;

      res
        .status(201)
        .json(
          await GameService.create(
            leagueMatchId,
            blueTeamId,
            redTeamId,
            riotMatchId,
            draftLink,
          ),
        );
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /{gameId}
   */
  public static readGame: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { gameId } = req.params;

      res.status(200).json(await GameService.findById(gameId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /{gameId}/{matchId}
   */
  public static assignMatchToGame: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { gameId, matchId } = req.params;

      res
        .status(200)
        .json(await GameService.updateMatchIdInGame(gameId!, matchId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /{gameId}/{draftLinkUrl}
   */
  public static assignDraftLinkToGame: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { gameId } = req.params;
      const { draftLink } = req.body as PatchGameDraftLinkBody;

      res
        .status(200)
        .json(await GameService.updateDraftLinkInGame(gameId!, draftLink));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /team/{gameId}/{side}/{teamId}
   */
  public static assignTeamToGame: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { gameId, side, teamId } = req.params;

      res
        .status(200)
        .json(await GameService.updateTeamInGame(gameId!, side!, teamId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE - /{gameId}
   */
  public static deleteGame: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { gameId } = req.params;

      res.status(200).json(await GameService.removeById(gameId!));
    } catch (err) {
      next(err);
    }
  };
}
