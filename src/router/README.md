# Overview

# Route Setup

## DTO

```typescript
import z from 'zod';

// POST - /
export const postNameBody = z.strictObject({});
export type CreateNameBody = z.infer<typeof postNameBody>;

// GET - /{nameId}
export const getNameParams = z.strictObject({
  nameId: z.uuid(),
});
export type NameDto = {};

// PUT - /{nameId}
export const putNameParams = getNameParams.clone();
export const putNameBody = z.strictObject({
  user: userRowSchema,
});
export type UpdateNameBody = z.infer<typeof putNameBody>;

// DELETE - /{userId}
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
  createName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json();
    } catch (err) {
      next(err);
    }
  },

  readName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  updateName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  deleteName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },
};
```
