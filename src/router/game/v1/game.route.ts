import { Router } from 'express';

import { validateBody, validateParams } from '@/util/validate.js';
import { GameController } from './game.controller.js';
import {
  deleteGameParams,
  getGameParams,
  patchGameMatchParams,
  patchGameTeamStatParams,
  postGameBody,
} from './game.zod.js';

export const gameRouter = Router();

gameRouter.post('/', validateBody(postGameBody), GameController.createGame);
gameRouter.get(
  '/:gameId',
  validateParams(getGameParams),
  GameController.readGame,
);
gameRouter.patch(
  '/:gameId/:matchId',
  validateParams(patchGameMatchParams),
  GameController.assignMatchToGame,
);
gameRouter.patch(
  'team-stats/:gameId/:side:/:teamId',
  validateParams(patchGameTeamStatParams),
  GameController.assignTeamToGame,
);
gameRouter.delete(
  '/:gameId',
  validateParams(deleteGameParams),
  GameController.deleteGame,
);
