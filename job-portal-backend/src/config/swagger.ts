import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI 3.0 configuration.
 *
 * API documentation is auto-generated and served at /api/docs.
 * Covers all endpoints: Auth, Roles, Profiles, Jobs, Applications, Admin Moderation & Analytics.
 */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Naukri4U API Documentation',
      version: '1.0.0',
      description:
        'Job Portal Backend REST API. Provides endpoints for authentication, role selection, profiles, job postings, applications, admin moderation, and analytics.',
      contact: {
        name: 'Naukri4U API Support',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1 Root',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 20 },
                total: { type: 'integer', example: 100 },
                totalPages: { type: 'integer', example: 5 },
                hasNextPage: { type: 'boolean', example: true },
                hasPrevPage: { type: 'boolean', example: false },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'phoneNumber' },
                  message: { type: 'string', example: 'Phone number is required' },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '66b3f9d8e4b0a1b2c3d4e5f6' },
            firebaseUid: { type: 'string', example: 'Gj0R3iCNj3M...' },
            phoneNumber: { type: 'string', example: '+919988776655' },
            role: { type: 'string', enum: ['admin', 'employer', 'employee'], nullable: true },
            status: { type: 'string', enum: ['active', 'blocked', 'deleted'] },
            isProfileCompleted: { type: 'boolean', example: true },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        RecruiterProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '6701a2b3c4d5e6f7a8b9c0d1' },
            userId: { type: 'string', example: '66b3f9d8e4b0a1b2c3d4e5f6' },
            name: { type: 'string', example: 'Rahul Sharma' },
            company: { type: 'string', example: 'Arohar Technologies' },
            designation: { type: 'string', example: 'HR Lead' },
          },
        },
        EmployeeProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '6702c4d5e6f7a8b9c0d1e2f3' },
            userId: { type: 'string', example: '66b3f9d8e4b0a1b2c3d4e5f6' },
            name: { type: 'string', example: 'Amit Mundra' },
            phone: { type: 'string', example: '7668942630' },
            skills: { type: 'string', example: 'React, Node.js, MongoDB' },
            experience: { type: 'string', example: '3 Years' },
            resumeUrl: { type: 'string', example: 'https://storage.naukri4u.com/resumes/resume.pdf' },
          },
        },
        Job: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '6703e5f6a7b8c9d0e1f2a3b4' },
            title: { type: 'string', example: '.NET Developer' },
            company: { type: 'string', example: 'Arohar Technologies' },
            location: { type: 'string', example: 'Noida / Remote' },
            description: { type: 'string', example: 'Looking for C# .NET Core Developer...' },
            salary: { type: 'string', example: '8 - 12 LPA' },
            status: { type: 'string', enum: ['active', 'pending', 'closed'] },
            postedBy: { type: 'string', example: '66b3f9d8e4b0a1b2c3d4e5f6' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Application: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '6705a7b8c9d0e1f2a3b4c5d6' },
            applicant: { type: 'string', example: '66b3f9d8e4b0a1b2c3d4e5f6' },
            job: { type: 'string', example: '6703e5f6a7b8c9d0e1f2a3b4' },
            status: { type: 'string', enum: ['applied', 'shortlisted', 'rejected', 'hired'] },
            resumeUrl: { type: 'string', example: 'https://storage.naukri4u.com/resumes/resume.pdf' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login with Firebase ID Token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firebaseIdToken'],
                  properties: {
                    firebaseIdToken: { type: 'string' },
                    deviceToken: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful' },
          },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh access token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: { refreshToken: { type: 'string' } },
                },
              },
            },
          },
          responses: { 200: { description: 'Token refreshed' } },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'Logout user session',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Logged out' } },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Profile returned' } },
        },
      },
      '/users/role': {
        post: {
          tags: ['Roles & Profiles'],
          summary: 'Select user role (employer or employee)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['role'],
                  properties: { role: { type: 'string', enum: ['employer', 'employee'] } },
                },
              },
            },
          },
          responses: { 200: { description: 'Role updated' } },
        },
      },
      '/profiles/me': {
        get: {
          tags: ['Roles & Profiles'],
          summary: 'Get current user profile details',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Profile details' } },
        },
      },
      '/profiles/employer': {
        put: {
          tags: ['Roles & Profiles'],
          summary: 'Upsert employer company profile',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Profile saved' } },
        },
      },
      '/profiles/employee': {
        put: {
          tags: ['Roles & Profiles'],
          summary: 'Upsert employee candidate profile',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Profile saved' } },
        },
      },
      '/jobs': {
        get: {
          tags: ['Jobs'],
          summary: 'Search & list job postings',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Jobs list' } },
        },
        post: {
          tags: ['Jobs'],
          summary: 'Create a new job posting',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Job created' } },
        },
      },
      '/jobs/{id}': {
        get: { tags: ['Jobs'], summary: 'Get job details by ID' },
        put: { tags: ['Jobs'], summary: 'Update job posting', security: [{ bearerAuth: [] }] },
        delete: { tags: ['Jobs'], summary: 'Soft-delete job posting', security: [{ bearerAuth: [] }] },
      },
      '/applications': {
        post: {
          tags: ['Applications'],
          summary: 'Apply to a job',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Application submitted' } },
        },
      },
      '/applications/my': {
        get: {
          tags: ['Applications'],
          summary: 'List my submitted job applications',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Applications list' } },
        },
      },
      '/applications/jobs/{jobId}': {
        get: {
          tags: ['Applications'],
          summary: 'List candidate applicants for a job',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Applicants list' } },
        },
      },
      '/applications/{id}/status': {
        patch: {
          tags: ['Applications'],
          summary: 'Update candidate application status',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Status updated' } },
        },
      },
      '/admin/dashboard': {
        get: {
          tags: ['Admin Console'],
          summary: 'Get dashboard statistics & charts data',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Dashboard stats' } },
        },
      },
      '/admin/analytics': {
        get: {
          tags: ['Admin Console'],
          summary: 'Get comprehensive analytics report',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Comprehensive analytics' } },
        },
      },
      '/admin/employees': {
        post: {
          tags: ['Admin Console'],
          summary: 'Admin manually register an Employee',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Employee registered' } },
        },
      },
      '/admin/recruiters': {
        post: {
          tags: ['Admin Console'],
          summary: 'Admin manually register a Recruiter',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Recruiter registered' } },
        },
      },
      '/admin/users/{id}/status': {
        patch: {
          tags: ['Admin Console'],
          summary: 'Block/Unblock/Activate user account',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Status updated' } },
        },
      },
      '/admin/users/{id}': {
        delete: {
          tags: ['Admin Console'],
          summary: 'Soft-delete a user account',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'User deleted' } },
        },
      },
    },
  },
  apis: ['./src/routes/v1/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
