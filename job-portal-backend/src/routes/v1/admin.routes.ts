import { Router } from 'express';
import { AdminController } from '../../controllers/admin.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';

/**
 * Admin Routes.
 *
 * All routes are protected by JWT authentication and
 * restricted to users with the 'admin' role.
 *
 * GET /admin/dashboard    — Aggregated dashboard statistics
 * GET /admin/users        — Paginated user list
 * GET /admin/recruiters   — Paginated recruiter profiles
 * GET /admin/employees    — Paginated employee profiles
 * GET /admin/jobs         — Paginated job listings
 * GET /admin/applications — Paginated applications
 */
const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireRole('admin'));

router.get('/dashboard', AdminController.getDashboardStats);
router.get('/users', AdminController.listUsers);
router.get('/recruiters', AdminController.listRecruiters);
router.get('/employees', AdminController.listEmployees);
router.get('/jobs', AdminController.listJobs);
router.get('/applications', AdminController.listApplications);

// Admin Moderation Controls
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.patch('/jobs/:id/status', AdminController.updateJobStatus);

export default router;
