# Overview

# Route Setup

## DTO

## Route

## Controller

```typescript
import type { NextFunction, Request, Response } from 'express';

export const UsersController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json();
    } catch (err) {
      next(err);
    }
  },

  read: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },
};
```
