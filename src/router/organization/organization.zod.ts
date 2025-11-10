import z from 'zod';

import { organizationRowSchema } from '@/database/schema.js';

// POST - /
export const postOrganizationBody = z.strictObject({
  organization: organizationRowSchema,
});
export type CreateOrganizationBody = z.infer<typeof postOrganizationBody>;

// GET - /{organizationId}
export const getOrganizationParams = z.strictObject({
  organizationId: z.uuid(),
});

// PUT - /{organizationId}
export const putOrganizationParams = getOrganizationParams.clone();
export const putOrganizationBody = z.strictObject({
  organization: organizationRowSchema,
});
export type UpdateOrganizationBody = z.infer<typeof putOrganizationBody>;

// DELETE - /{organizationId}
export const deleteOrganizationParams = getOrganizationParams.clone();
