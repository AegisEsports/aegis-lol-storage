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
const gameController = new GameController();

gameRouter.post('/', validateBody(postGameBody), gameController.createGame);
gameRouter.get(
  '/:gameId',
  validateParams(getGameParams),
  gameController.readGame,
);
gameRouter.patch(
  '/match/:gameId/:matchId',
  validateParams(patchGameMatchParams),
  gameController.assignMatchToGame,
);
gameRouter.patch(
  '/draft-link/:gameId',
  validateParams(patchGameDraftLinkParams),
  validateBody(patchGameDraftLinkBody),
  gameController.assignDraftLinkToGame,
);
gameRouter.patch(
  '/team/:gameId/:side/:teamId',
  validateParams(patchGameTeamParams),
  gameController.assignTeamToGame,
);
gameRouter.delete(
  '/:gameId',
  validateParams(deleteGameParams),
  gameController.deleteGame,
);
