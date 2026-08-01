import { Router } from 'express';
import { JobController } from '../../controllers/job.controller';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createJobValidation,
  updateJobValidation,
  queryJobsValidation,
} from '../../validators/job.validator';
import { UserRole } from '../../interfaces/user.interface';

const router = Router();

// Public / optional auth routes
router.get('/', optionalAuthenticate, validate(queryJobsValidation), JobController.listJobs);
router.get('/:id', optionalAuthenticate, JobController.getJobById);

// Protected routes (require auth)
router.post(
  '/',
  authenticate,
  requireRole(UserRole.EMPLOYER as unknown as import('../../constants/roles').RoleName, 'admin'),
  validate(createJobValidation),
  JobController.createJob,
);

router.put(
  '/:id',
  authenticate,
  requireRole(UserRole.EMPLOYER as unknown as import('../../constants/roles').RoleName, 'admin'),
  validate(updateJobValidation),
  JobController.updateJob,
);

router.delete(
  '/:id',
  authenticate,
  requireRole(UserRole.EMPLOYER as unknown as import('../../constants/roles').RoleName, 'admin'),
  JobController.deleteJob,
);

export default router;
