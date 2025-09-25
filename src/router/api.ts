// Aggregate all routers under /api

import { Router } from 'express';

import { leagueRouter } from '@/router/league/v1/league.route.js';
import { splitRouter } from '@/router/split/v1/split.route.js';
import { teamRouter } from '@/router/team/v1/team.route.js';
import { userRouter } from '@/router/user/v1/user.route.js';

export const api = Router();

// Group by version
const v1 = Router();
v1.use('/user/v1', userRouter);
v1.use('/league/v1', leagueRouter);
v1.use('/split/v1/', splitRouter);
v1.use('/team/v1/', teamRouter);
api.use(v1);

// Health check
api.get('/health', (_req, res) => res.json({ ok: true, scope: 'api' }));
