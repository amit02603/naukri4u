import { Router } from 'express';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';

/**
 * V1 route aggregator.
 *
 * All v1 routes are mounted here and then exported
 * to the version router in routes/index.ts.
 */
const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);

export default router;
