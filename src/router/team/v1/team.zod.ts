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

// PATCH - /roster-request/approve/{teamRosterId}/{reviewedUserId}
export const patchApproveRosterRequestParams = z.strictObject({
  teamRosterId: z.uuid(),
  reviewedUserId: z.uuid(),
});

// PATCH - /roster-request/deny/{teamRosterId}/{reviewedUserId}
export const patchDenyRosterRequestParams =
  patchApproveRosterRequestParams.clone();

// PATCH - /emergency-sub-request/approve/{teamRosterId}/{reviewedUserId}
export const patchApproveEmergencySubRequestParams =
  patchApproveRosterRequestParams.clone();

// PATCH - /emergency-sub-request/deny/{teamRosterId}/{reviewedUserId}
export const patchDenyEmergencySubRequestParams =
  patchApproveRosterRequestParams.clone();

// DELETE - /{teamId}
export const deleteTeamParams = getTeamParams.clone();
