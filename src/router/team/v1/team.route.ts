import { Router } from 'express';

import { TeamController } from '@/router/team/v1/team.controller.js';
import {
  deleteTeamParams,
  getTeamParams,
  patchApproveEmergencySubRequestParams,
  patchApproveRosterRequestParams,
  patchDenyEmergencySubRequestParams,
  patchDenyRosterRequestParams,
  patchTeamOrganizationParams,
  postEmergencySubRequestBody,
  postRosterRequestBody,
  postTeamBody,
  putTeamBody,
  putTeamParams,
  putTeamRosterBody,
  putTeamRosterParams,
} from '@/router/team/v1/team.zod.js';
import { validateBody, validateParams } from '@/util/validate.js';

export const teamRouter = Router();

teamRouter.post('/', validateBody(postTeamBody), TeamController.createTeam);
teamRouter.post(
  '/roster-request',
  validateBody(postRosterRequestBody),
  TeamController.createRosterRequest,
);
teamRouter.post(
  '/emergency-sub-request',
  validateBody(postEmergencySubRequestBody),
  TeamController.createEmergencySubRequest,
);
teamRouter.get(
  '/:teamId',
  validateParams(getTeamParams),
  TeamController.readTeam,
);
teamRouter.put(
  '/:teamId',
  validateParams(putTeamParams),
  validateBody(putTeamBody),
  TeamController.updateTeam,
);
teamRouter.put(
  '/team-roster/:teamRosterId',
  validateParams(putTeamRosterParams),
  validateBody(putTeamRosterBody),
  TeamController.updateTeamRoster,
);
teamRouter.patch(
  '/:teamId/:organizationId',
  validateParams(patchTeamOrganizationParams),
  TeamController.assignOrganizationToTeam,
);
teamRouter.patch(
  '/roster-request/approve/:teamRosterId/:reviewedUserId',
  validateParams(patchApproveRosterRequestParams),
  TeamController.approveRosterRequest,
);
teamRouter.patch(
  '/roster-request/deny/:teamRosterId/:reviewedUserId',
  validateParams(patchDenyRosterRequestParams),
  TeamController.denyRosterRequest,
);
teamRouter.patch(
  '/emergency-sub-request/approve/:teamRosterId/:reviewedUserId',
  validateParams(patchApproveEmergencySubRequestParams),
  TeamController.approveEmergencySubRequest,
);
teamRouter.patch(
  '/emergency-sub-request/deny/:teamRosterId/:reviewedUserId',
  validateParams(patchDenyEmergencySubRequestParams),
  TeamController.denyEmergencySubRequest,
);
teamRouter.delete(
  '/:teamId',
  validateParams(deleteTeamParams),
  TeamController.deleteTeam,
);
