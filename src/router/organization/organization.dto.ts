import type { OrganizationRow, TeamRow } from '@/database/schema.js';

// OrganizationDto
export type OrganizationDto = {
  organization: OrganizationRow;
  teams: TeamRow[];
};

// TableOrganizationDto
export type OrganizationTableDto = {
  organization: OrganizationRow;
};
