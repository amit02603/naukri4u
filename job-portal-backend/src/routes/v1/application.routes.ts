import { Router } from 'express';
import { ApplicationController } from '../../controllers/application.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createApplicationValidation,
  updateApplicationStatusValidation,
} from '../../validators/application.validator';
import { UserRole } from '../../interfaces/user.interface';

const router = Router();

// All application endpoints require auth
router.use(authenticate);

// Submit application (employee / candidate)
router.post(
  '/',
  requireRole(UserRole.EMPLOYEE as unknown as import('../../constants/roles').RoleName, 'admin'),
  validate(createApplicationValidation),
  ApplicationController.applyToJob,
);

// My applications (employee / candidate)
router.get(
  '/my',
  requireRole(UserRole.EMPLOYEE as unknown as import('../../constants/roles').RoleName, 'admin'),
  ApplicationController.getMyApplications,
);

// View applicants for a job (employer / recruiter / admin)
router.get(
  '/jobs/:jobId',
  requireRole(UserRole.EMPLOYER as unknown as import('../../constants/roles').RoleName, 'admin'),
  ApplicationController.getJobApplications,
);

// Update status of an application (employer / recruiter / admin)
router.patch(
  '/:id/status',
  requireRole(UserRole.EMPLOYER as unknown as import('../../constants/roles').RoleName, 'admin'),
  validate(updateApplicationStatusValidation),
  ApplicationController.updateApplicationStatus,
);

export default router;
