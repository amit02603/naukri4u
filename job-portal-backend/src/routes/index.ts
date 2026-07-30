import { Router } from 'express';
import v1Routes from './v1';

/**
 * Version router.
 *
 * Mounts versioned route modules under /api/v{n}.
 * When API v2 is introduced, it will be added here without
 * breaking existing v1 consumers.
 *
 * @example
 * /api/v1/auth/login
 * /api/v1/health
 * /api/v2/... (future)
 */
const router = Router();

router.use('/v1', v1Routes);

export default router;
