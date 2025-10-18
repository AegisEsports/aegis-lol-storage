import { Router } from 'express';

import { validateBody, validateParams } from '@/util/validate.js';
import { GameController } from './game.controller.js';
import {
  deleteGameParams,
  getGameParams,
  patchGameDraftLinkBody,
  patchGameDraftLinkParams,
  patchGameMatchParams,
  patchGameTeamParams,
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
  '/match/:gameId/:matchId',
  validateParams(patchGameMatchParams),
  GameController.assignMatchToGame,
);
gameRouter.patch(
  '/draft-link/:gameId',
  validateParams(patchGameDraftLinkParams),
  validateBody(patchGameDraftLinkBody),
  GameController.assignDraftLinkToGame,
);
gameRouter.patch(
  '/team/:gameId/:side/:teamId',
  validateParams(patchGameTeamParams),
  GameController.assignTeamToGame,
);
gameRouter.delete(
  '/:gameId',
  validateParams(deleteGameParams),
  GameController.deleteGame,
);
