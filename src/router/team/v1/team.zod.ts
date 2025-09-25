import z from 'zod';

import {
  emergencySubRequestRowSchema,
  rosterRequestRowSchema,
  teamRosterRowSchema,
  teamRowSchema,
} from '@/database/schema.js';

// POST - /
export const postTeamBody = z.strictObject({
  team: teamRowSchema,
  roster: z.array(teamRosterRowSchema.omit({ teamId: true })).default([]),
});
export type CreateTeamBody = z.infer<typeof postTeamBody>;
export type CreateTeamRoster = z.infer<typeof postTeamBody>['roster'];

// POST - /roster-request
export const postRosterRequestBody = z.strictObject({
  rosterRequest: rosterRequestRowSchema,
});
export type CreateRosterRequestBody = z.infer<typeof postRosterRequestBody>;

// POST - /emergency-sub-request
export const postEmergencySubRequestBody = z.strictObject({
  emergencySubRequest: emergencySubRequestRowSchema,
});
export type CreateEmergencySubRequestBody = z.infer<
  typeof postEmergencySubRequestBody
>;

// GET - /{teamId}
export const getTeamParams = z.strictObject({
  teamId: z.uuid(),
});

// PUT - /{teamId}
export const putTeamParams = getTeamParams.clone();
export const putTeamBody = z.strictObject({
  team: teamRowSchema,
});
export type UpdateTeamBody = z.infer<typeof putTeamBody>;

// PUT - /team-roster/{teamRosterId}
export const putTeamRosterParams = z.strictObject({
  teamRosterId: z.uuid(),
});
export const putTeamRosterBody = z.strictObject({
  teamRoster: teamRosterRowSchema,
});
export type UpdateTeamRosterBody = z.infer<typeof putTeamRosterBody>;

// PATCH - /{teamId}/{organizationId}
export const patchTeamOrganizationParams = z.strictObject({
  teamId: z.uuid(),
  organizationId: z.uuid(),
});

// PATCH - /roster-request/approve/{rosterRequestId}/{reviewedUserId}
export const patchApproveRosterRequestParams = z.strictObject({
  rosterRequestId: z.uuid(),
  reviewedUserId: z.uuid(),
});

// PATCH - /roster-request/deny/{rosterRequestId}/{reviewedUserId}
export const patchDenyRosterRequestParams =
  patchApproveRosterRequestParams.clone();

// PATCH - /emergency-sub-request/approve/{emergencySubRequestId}/{reviewedUserId}
export const patchApproveEmergencySubRequestParams = z.strictObject({
  emergencySubRequestId: z.uuid(),
  reviewedUserId: z.uuid(),
});

// PATCH - /emergency-sub-request/deny/{emergencySubRequestId}/{reviewedUserId}
export const patchDenyEmergencySubRequestParams =
  patchApproveEmergencySubRequestParams.clone();

// DELETE - /{teamId}
export const deleteTeamParams = getTeamParams.clone();
