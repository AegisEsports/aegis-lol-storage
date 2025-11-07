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

splitRouter.post('/', validateBody(postSplitBody), SplitController.createSplit);
splitRouter.get(
  '/:splitId',
  validateParams(getSplitParams),
  SplitController.readSplit,
);
splitRouter.get(
  '/players/:splitId',
  validateParams(getSplitPlayerStatsParams),
  SplitController.readSplitPlayerStats,
);
splitRouter.get(
  '/teams/:splitId',
  validateParams(getSplitTeamStatsParams),
  SplitController.readTeamPlayerStats,
);
splitRouter.get(
  '/games/:splitId',
  validateParams(getSplitGamesParams),
  SplitController.readSplitGames,
);
splitRouter.get(
  '/champs/:splitId',
  validateParams(getSplitChampionStatsParams),
  SplitController.readSplitChampionStats,
);
splitRouter.put(
  '/:splitId',
  validateParams(putSplitParams),
  validateBody(putSplitBody),
  SplitController.updateSplit,
);
splitRouter.delete(
  '/:splitId',
  validateParams(deleteSplitParams),
  SplitController.deleteSplit,
);
