import { UserRepository } from '../repositories/user.repository';
import { RecruiterProfileRepository } from '../repositories/recruiterProfile.repository';
import { EmployeeProfileRepository } from '../repositories/employeeProfile.repository';
import { UserRole } from '../interfaces/user.interface';
import { IRecruiterProfile, IEmployeeProfile } from '../interfaces/profile.interface';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

const userRepo = new UserRepository();
const recruiterProfileRepo = new RecruiterProfileRepository();
const employeeProfileRepo = new EmployeeProfileRepository();

/**
 * Service for Profile Management & Role Selection.
 */
export class ProfileService {
  /**
   * Sets or updates user role (employer or employee).
   */
  async selectRole(userId: string, role: UserRole) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (role !== UserRole.EMPLOYER && role !== UserRole.EMPLOYEE) {
      throw ApiError.badRequest(`Invalid role selection. Must be ${UserRole.EMPLOYER} or ${UserRole.EMPLOYEE}`);
    }

    const updatedUser = await userRepo.updateUser(userId, { role });
    logger.info('User role set', { userId, role });

    return {
      id: updatedUser!._id.toString(),
      phoneNumber: updatedUser!.phoneNumber,
      role: updatedUser!.role,
      isProfileCompleted: updatedUser!.isProfileCompleted,
    };
  }

  /**
   * Fetches profile for a user based on their assigned role.
   */
  async getProfile(userId: string, role: string) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    let profile: IRecruiterProfile | IEmployeeProfile | null = null;

    if (role === UserRole.EMPLOYER || role === UserRole.ADMIN) {
      profile = await recruiterProfileRepo.findByUserId(userId);
    }
    if (role === UserRole.EMPLOYEE || (!profile && role === UserRole.ADMIN)) {
      profile = await employeeProfileRepo.findByUserId(userId);
    }

    return {
      user: {
        id: user._id.toString(),
        phoneNumber: user.phoneNumber,
        role: user.role,
        isProfileCompleted: user.isProfileCompleted,
      },
      profile: profile || null,
    };
  }

  /**
   * Creates or updates Employer (Recruiter) Profile.
   */
  async upsertEmployerProfile(
    userId: string,
    data: { name: string; company: string; designation?: string },
  ) {
    let profile = await recruiterProfileRepo.findByUserId(userId);

    if (profile) {
      profile = await recruiterProfileRepo.updateById(profile._id, { $set: data });
    } else {
      profile = await recruiterProfileRepo.create({
        userId: userId as unknown as IRecruiterProfile['userId'],
        ...data,
      });
    }

    // Mark user profile as completed
    await userRepo.updateUser(userId, { isProfileCompleted: true });

    return profile;
  }

  /**
   * Creates or updates Employee Profile.
   */
  async upsertEmployeeProfile(
    userId: string,
    data: { name: string; phone?: string; skills?: string; experience?: string; resumeUrl?: string },
  ) {
    let profile = await employeeProfileRepo.findByUserId(userId);

    if (profile) {
      profile = await employeeProfileRepo.updateById(profile._id, { $set: data });
    } else {
      profile = await employeeProfileRepo.create({
        userId: userId as unknown as IEmployeeProfile['userId'],
        ...data,
      });
    }

    // Mark user profile as completed
    await userRepo.updateUser(userId, { isProfileCompleted: true });

    return profile;
  }
}
