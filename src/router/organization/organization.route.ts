import { Router } from 'express';

import { validateBody, validateParams } from '@/util/validate.js';
import { OrganizationController } from './organization.controller.js';
import {
  deleteOrganizationParams,
  getOrganizationParams,
  postOrganizationBody,
  putOrganizationBody,
  putOrganizationParams,
} from './organization.zod.js';

export const organizationRouter = Router();
const organizationController = new OrganizationController();

organizationRouter.post(
  '/',
  validateBody(postOrganizationBody),
  organizationController.createOrganization,
);
organizationRouter.get(
  '/:organizationId',
  validateParams(getOrganizationParams),
  organizationController.readOrganization,
);
organizationRouter.put(
  '/:organizationId',
  validateParams(putOrganizationParams),
  validateBody(putOrganizationBody),
  organizationController.updateOrganization,
);
organizationRouter.delete(
  '/:organizationId',
  validateParams(deleteOrganizationParams),
  organizationController.deleteOrganization,
);
