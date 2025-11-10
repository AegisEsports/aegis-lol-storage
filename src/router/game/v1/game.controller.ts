import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { db } from '@/database/database.js';
import { GameService } from './game.service.js';
import type { CreateGameBody, PatchGameDraftLinkBody } from './game.zod.js';

export class GameController {
  private game: GameService = new GameService(db);

  /**
   * POST - /
   */
  public createGame: RequestHandler = async (
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
          await this.game.create(
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
  public readGame: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { gameId } = req.params;

      res.status(200).json(await this.game.findById(gameId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /{gameId}/{matchId}
   */
  public assignMatchToGame: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { gameId, matchId } = req.params;

      res
        .status(200)
        .json(await this.game.updateMatchIdInGame(gameId!, matchId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /{gameId}/{draftLinkUrl}
   */
  public assignDraftLinkToGame: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { gameId } = req.params;
      const { draftLink } = req.body as PatchGameDraftLinkBody;

      res
        .status(200)
        .json(await this.game.updateDraftLinkInGame(gameId!, draftLink));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /team/{gameId}/{side}/{teamId}
   */
  public assignTeamToGame: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { gameId, side, teamId } = req.params;

      res
        .status(200)
        .json(await this.game.updateTeamInGame(gameId!, side!, teamId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE - /{gameId}
   */
  public deleteGame: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { gameId } = req.params;

      res.status(200).json(await this.game.removeById(gameId!));
    } catch (err) {
      next(err);
    }
  };
}
