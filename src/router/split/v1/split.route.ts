import { Router } from 'express';

import { SplitController } from '@/router/split/v1/split.controller.js';
import {
  deleteSplitParams,
  getSplitChampionStatsParams,
  getSplitGamesParams,
  getSplitParams,
  getSplitPlayerStatsParams,
  getSplitTeamStatsParams,
  postSplitBody,
  putSplitBody,
  putSplitParams,
} from '@/router/split/v1/split.zod.js';
import { validateBody, validateParams } from '@/util/validate.js';

export const splitRouter = Router();
const splitController = new SplitController();

splitRouter.post('/', validateBody(postSplitBody), splitController.createSplit);
splitRouter.get(
  '/:splitId',
  validateParams(getSplitParams),
  splitController.readSplit,
);
splitRouter.get(
  '/players/:splitId',
  validateParams(getSplitPlayerStatsParams),
  splitController.readSplitPlayerStats,
);
splitRouter.get(
  '/teams/:splitId',
  validateParams(getSplitTeamStatsParams),
  splitController.readTeamPlayerStats,
);
splitRouter.get(
  '/games/:splitId',
  validateParams(getSplitGamesParams),
  splitController.readSplitGames,
);
splitRouter.get(
  '/champs/:splitId',
  validateParams(getSplitChampionStatsParams),
  splitController.readSplitChampionStats,
);
splitRouter.put(
  '/:splitId',
  validateParams(putSplitParams),
  validateBody(putSplitBody),
  splitController.updateSplit,
);
splitRouter.delete(
  '/:splitId',
  validateParams(deleteSplitParams),
  splitController.deleteSplit,
);
