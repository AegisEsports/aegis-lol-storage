import type { Kysely } from 'kysely';

import type { Database } from '@/database/database.js';
import { OrganizationsQuery, TeamsQuery } from '@/database/query.js';
import type {
  InsertOrganization,
  UpdateOrganization,
} from '@/database/schema.js';
import ControllerError from '@/util/errors/controllerError.js';
import type {
  OrganizationDto,
  OrganizationTableDto,
} from './organization.dto.js';

export class OrganizationService {
  constructor(private db: Kysely<Database>) {}

  /**
   * Creates a singular entry of an organization.
   */
  public create = async (
    organizationData: InsertOrganization,
  ): Promise<OrganizationDto> => {
    const insertedOrganization = await OrganizationsQuery.insert(
      this.db,
      organizationData,
    );

    return {
      organization: insertedOrganization,
      teams: [],
    };
  };

  /**
   * Retrieves a singular entry of an organization.
   */
  public findById = async (
    organizationId: string,
  ): Promise<OrganizationDto> => {
    const getOrganization = await OrganizationsQuery.selectById(
      this.db,
      organizationId,
    );
    if (!getOrganization) {
      throw new ControllerError(404, 'NotFound', 'Organization not found', {
        organizationId,
      });
    }
    const getTeams = await TeamsQuery.listByOrganizationId(
      this.db,
      organizationId,
    );

    return {
      organization: getOrganization,
      teams: getTeams,
    };
  };

  /**
   * Updates a singular entry of an organization.
   */
  public replaceById = async (
    organizationId: string,
    organizationData: UpdateOrganization,
  ): Promise<OrganizationTableDto> => {
    const updatedOrganization = await OrganizationsQuery.updateById(
      this.db,
      organizationId,
      organizationData,
    );
    if (!updatedOrganization) {
      throw new ControllerError(404, 'NotFound', 'Organization not found', {
        organizationId,
      });
    }

    return {
      organization: updatedOrganization,
    };
  };

  /**
   * Deletes a singular entry of an organization.
   */
  public removeById = async (
    organizationId: string,
  ): Promise<OrganizationTableDto> => {
    const deletedOrganization = await OrganizationsQuery.deleteById(
      this.db,
      organizationId,
    );
    if (!deletedOrganization) {
      throw new ControllerError(404, 'NotFound', 'Organization not found', {
        organizationId,
      });
    }

    return {
      organization: deletedOrganization,
    };
  };
}
