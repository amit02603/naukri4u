import { UserRepository } from '../repositories/user.repository';
import { JobRepository } from '../repositories/job.repository';
import { ApplicationRepository } from '../repositories/application.repository';
import { RecruiterProfileRepository } from '../repositories/recruiterProfile.repository';
import { EmployeeProfileRepository } from '../repositories/employeeProfile.repository';
import { AuditLogRepository } from '../repositories/auditLog.repository';
import { FilterQuery } from 'mongoose';
import { IUser } from '../interfaces/user.interface';
import { IJob } from '../interfaces/job.interface';
import { IApplication } from '../interfaces/application.interface';
import { logger } from '../config/logger';

const userRepo = new UserRepository();
const jobRepo = new JobRepository();
const applicationRepo = new ApplicationRepository();
const recruiterProfileRepo = new RecruiterProfileRepository();
const employeeProfileRepo = new EmployeeProfileRepository();
const auditLogRepo = new AuditLogRepository();

/**
 * Admin Dashboard Service.
 *
 * Aggregates data from all collections to power the admin dashboard
 * stats, charts, and tables.
 */
export class AdminService {
  /**
   * Returns all dashboard statistics in a single response.
   */
  async getDashboardStats() {
    try {
      const [
        totalUsers,
        totalJobs,
        totalApplications,
        totalRecruiters,
        totalEmployees,
        userDistribution,
        applicationTrend,
        recentJobs,
        recentActivity,
      ] = await Promise.all([
        userRepo.count({} as FilterQuery<IUser>),
        jobRepo.count({} as FilterQuery<IJob>),
        applicationRepo.count({} as FilterQuery<IApplication>),
        recruiterProfileRepo.count(),
        employeeProfileRepo.count(),
        userRepo.countByRole(),
        applicationRepo.getMonthlyTrend(6),
        jobRepo.find({} as FilterQuery<IJob>, { limit: 5, sort: { createdAt: -1 } }),
        auditLogRepo.findMany({ skip: 0, limit: 10, sort: { createdAt: -1 } }),
      ]);

      // Format user distribution for the pie chart
      const formattedDistribution = userDistribution.map((item) => ({
        role: item._id || 'unassigned',
        count: item.count,
      }));

      // Fill missing months in the trend data
      const filledTrend = this.fillMonthlyTrend(applicationTrend, 6);

      // Format recent activity from audit logs
      const formattedActivity = recentActivity.logs.map((log) => ({
        message: this.formatAuditMessage(log.action, log.resource),
        time: log.createdAt,
      }));

      // Format recent jobs
      const formattedJobs = recentJobs.map((job) => ({
        id: job._id,
        title: job.title,
        company: job.company,
        status: job.status,
        createdAt: job.createdAt,
      }));

      return {
        stats: {
          totalUsers,
          totalRecruiters,
          totalJobs,
          totalApplications,
          totalEmployees,
        },
        userDistribution: formattedDistribution,
        applicationTrend: filledTrend,
        recentActivity: formattedActivity,
        recentJobs: formattedJobs,
      };
    } catch (error) {
      logger.error('Failed to fetch dashboard stats', { error });
      throw error;
    }
  }

  /**
   * Lists users with pagination.
   */
  async listUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return userRepo.listUsers({
      skip,
      limit,
      sort: { createdAt: -1 },
    });
  }

  /**
   * Lists recruiter profiles with pagination.
   */
  async listRecruiters(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return recruiterProfileRepo.listAll({
      skip,
      limit,
      sort: { createdAt: -1 },
    });
  }

  /**
   * Lists employee profiles with pagination.
   */
  async listEmployees(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return employeeProfileRepo.listAll({
      skip,
      limit,
      sort: { createdAt: -1 },
    });
  }

  /**
   * Lists jobs with pagination.
   */
  async listJobs(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return jobRepo.listJobs({
      skip,
      limit,
      sort: { createdAt: -1 },
    });
  }

  /**
   * Lists applications with pagination and populated refs.
   */
  async listApplications(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return applicationRepo.listApplications({
      skip,
      limit,
      sort: { createdAt: -1 },
    });
  }

  /**
   * Fills in missing months with zero counts for chart continuity.
   */
  private fillMonthlyTrend(
    data: Array<{ month: string; count: number }>,
    months: number,
  ): Array<{ month: string; count: number }> {
    const result: Array<{ month: string; count: number }> = [];
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const existing = data.find((item) => item.month === key);
      result.push({
        month: monthNames[d.getMonth()],
        count: existing ? existing.count : 0,
      });
    }

    return result;
  }

  /**
   * Converts raw audit log action strings into human-readable messages.
   */
  private formatAuditMessage(action: string, resource: string): string {
    const actionMap: Record<string, string> = {
      'user.login': 'User logged in',
      'user.create': 'New user registered',
      'user.logout': 'User logged out',
      'job.create': 'New job posted',
      'job.update': 'Job listing updated',
      'application.create': 'New application received',
      'recruiter.register': 'New recruiter registered',
    };

    return actionMap[action] || `${action} on ${resource}`;
  }
}
