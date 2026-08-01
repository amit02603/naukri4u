import { Router } from 'express';
import { ProfileController } from '../../controllers/profile.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  selectRoleValidation,
  updateEmployerProfileValidation,
  updateEmployeeProfileValidation,
} from '../../validators/profile.validator';
import { UserRole } from '../../interfaces/user.interface';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

// Role selection (accessible by any logged-in user)
router.post('/users/role', validate(selectRoleValidation), ProfileController.selectRole);

// Get current user profile
router.get('/profiles/me', ProfileController.getMyProfile);

// Update Employer profile (restricted to employer / admin)
router.put(
  '/profiles/employer',
  requireRole(UserRole.EMPLOYER as unknown as import('../../constants/roles').RoleName, 'admin'),
  validate(updateEmployerProfileValidation),
  ProfileController.updateEmployerProfile,
);

// Update Employee profile (restricted to employee / admin)
router.put(
  '/profiles/employee',
  requireRole(UserRole.EMPLOYEE as unknown as import('../../constants/roles').RoleName, 'admin'),
  validate(updateEmployeeProfileValidation),
  ProfileController.updateEmployeeProfile,
);

export default router;
