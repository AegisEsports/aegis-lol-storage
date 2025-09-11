// Aggregate all routers under /api

import { Router } from 'express';

import { userRouter } from '@/router/user/v1/user.route.js';

export const api = Router();

// Group by version
const v1 = Router();
v1.use('/user/v1', userRouter);
api.use(v1);

// Health check
api.get('/health', (_req, res) => res.json({ ok: true, scope: 'api' }));
