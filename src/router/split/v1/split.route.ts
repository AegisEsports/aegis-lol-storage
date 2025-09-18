import { Router } from 'express';

import { SplitController } from '@/router/split/v1/split.controller.js';
import {
  deleteSplitParams,
  getSplitParams,
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
  SplitController.getSplit,
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
