import { Router } from 'express';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import adminRoutes from './admin.routes';
import profileRoutes from './profile.routes';
import jobRoutes from './job.routes';
import applicationRoutes from './application.routes';

/**
 * V1 route aggregator.
 *
 * All v1 routes are mounted here and then exported
 * to the version router in routes/index.ts.
 */
const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/admin', adminRoutes);
router.use('/', profileRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);

export default router;
