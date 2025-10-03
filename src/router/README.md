# Overview

# Route Setup Template

## DTO

```typescript
// NameDto
export type NameDto = {};

// TableNameDto
export type NameTableDto = {};
```

## Zod

```typescript
import z from 'zod';

// POST - /
export const postNameBody = z.strictObject({});
export type CreateNameBody = z.infer<typeof postNameBody>;

// GET - /{nameId}
export const getNameParams = z.strictObject({
  nameId: z.uuid(),
});

// PUT - /{nameId}
export const putNameParams = getNameParams.clone();
export const putNameBody = z.strictObject({
  name: nameRowSchema,
});
export type UpdateNameBody = z.infer<typeof putNameBody>;

// DELETE - /{nameId}
export const deleteNameParams = getNameParams.clone();
```

## Route

```typescript
import { Router } from 'express';

import { validateBody, validateParams } from '@/util/validate.js';
import { NameController } from './name.controller.js';
import {
  deleteNameParams,
  getNameParams,
  postNameBody,
  putNameBody,
  putNameParams,
} from './name.zod.js';

export const nameRouter = Router();

nameRouter.post('/', validateBody(postNameBody), NameController.createName);
nameRouter.get(
  '/:nameId',
  validateParams(getNameParams),
  NameController.readName,
);
nameRouter.put(
  '/:nameId',
  validateParams(putNameParams),
  validateBody(putNameBody),
  NameController.updateName,
);
nameRouter.delete(
  '/:nameId',
  validateParams(deleteNameParams),
  NameController.deleteName,
);
```

## Controller

```typescript
import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { NameService } from './name.service.js';
import type { CreateNameBody, UpdateNameBody } from './name.zod.js';

export class NameController {
  /**
   * POST - /
   */
  public static createName: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { name } = req.body as CreateNameBody;

      res.status(201).json(await NameService.create(name));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /{nameId}
   */
  public static readName: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { nameId } = req.params;

      res.status(200).json(await NameService.findById(nameId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /{nameId}
   */
  public static updateName: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { nameId } = req.params;
      const { name } = req.body as UpdateNameBody;

      res.status(200).json(await NameService.replaceById(nameId!, name));
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE - /{nameId}
   */
  public static deleteName: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { nameId } = req.params;

      res.status(200).json(await NameService.removeById(nameId!));
    } catch (err) {
      next(err);
    }
  };
}
```

## Service

```typescript
import { NamesQuery } from '@/database/query.js';
import type { InsertName, UpdateName } from '@/database/schema.js';
import ControllerError from '@/util/errors/controllerError.js';
import type { NameDto, NameTableDto } from './name.dto.js';

export class NameService {
  /**
   * Creates a singular entry of a name.
   */
  public static create = async (nameData: InsertName): Promise<NameDto> => {
    const insertedName = await NamesQuery.insert(nameData);

    return {
      name: insertedName,
    };
  };

  /**
   * Retrieves a singular entry of a name.
   */
  public static findById = async (nameId: string): Promise<NameDto> => {
    const getName = await NamesQuery.selectById(nameId);
    if (!getName) {
      throw new ControllerError(404, 'NotFound', 'Name not found', {
        nameId,
      });
    }

    return {
      name: getName,
    };
  };

  /**
   * Updates a singular entry of a name.
   */
  public static replaceById = async (
    nameId: string,
    nameData: UpdateName,
  ): Promise<NameTableDto> => {
    const updatedName = await NamesQuery.updateById(nameId, nameData);
    if (!updatedName) {
      throw new ControllerError(404, 'NotFound', 'Name not found', {
        nameId,
      });
    }

    return {
      name: updatedName,
    };
  };

  /**
   * Deletes a singular entry of a name.
   */
  public static removeById = async (nameId: string): Promise<NameTableDto> => {
    const deletedName = await NamesQuery.deleteById(nameId);
    if (!deletedName) {
      throw new ControllerError(404, 'NotFound', 'Name not found', {
        nameId,
      });
    }

    return {
      name: deletedName,
    };
  };
}
```
