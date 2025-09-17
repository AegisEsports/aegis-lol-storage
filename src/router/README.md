# Overview

# Route Setup Template

## DTO

```typescript
// NameDto
export type NameDto = {};
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

export const nameRouter = Router();

nameRouter.post('/', validateBody(), NameController.createName);
nameRouter.get('/:nameId', validateParams(), NameController.readName);
nameRouter.put(
  '/:nameId',
  validateParams(),
  validateBody(),
  NameController.updateName,
);
nameRouter.delete('/:nameId', validateParams(), NameController.deleteName);
```

## Controller

```typescript
import type { NextFunction, Request, Response } from 'express';

export const NameController = {
  /**
   * POST - /
   *
   *
   */
  createName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET - /{nameId}
   *
   *
   */
  readName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT - /{nameId}
   *
   *
   */
  updateName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE - /{nameId}
   *
   *
   */
  deleteName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },
};
```
