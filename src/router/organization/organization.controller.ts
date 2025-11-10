import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { db } from '@/database/database.js';
import { OrganizationService } from './organization.service.js';
import type {
  CreateOrganizationBody,
  UpdateOrganizationBody,
} from './organization.zod.js';

export class OrganizationController {
  private organization: OrganizationService = new OrganizationService(db);

  /**
   * POST - /
   */
  public createOrganization: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { organization } = req.body as CreateOrganizationBody;

      res.status(201).json(await this.organization.create(organization));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /{organizationId}
   */
  public readOrganization: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { organizationId } = req.params;

      res.status(200).json(await this.organization.findById(organizationId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /{organizationId}
   */
  public updateOrganization: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { organizationId } = req.params;
      const { organization } = req.body as UpdateOrganizationBody;

      res
        .status(200)
        .json(
          await this.organization.replaceById(organizationId!, organization),
        );
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE - /{organizationId}
   */
  public deleteOrganization: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { organizationId } = req.params;

      res.status(200).json(await this.organization.removeById(organizationId!));
    } catch (err) {
      next(err);
    }
  };
}
