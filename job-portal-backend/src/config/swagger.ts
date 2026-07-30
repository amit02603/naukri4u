import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI 3.0 configuration.
 *
 * API documentation is auto-generated from JSDoc annotations in route files.
 * Swagger UI is served at /api/docs in non-production environments.
 */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Portal API',
      version: '1.0.0',
      description:
        'Production-ready Job Portal Backend API. Provides REST endpoints for authentication, user management, job posting, applications, and more.',
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
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
                limit: { type: 'integer', example: 10 },
                total: { type: 'integer', example: 100 },
                totalPages: { type: 'integer', example: 10 },
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
            id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            firebaseUid: { type: 'string', example: 'abc123def456' },
            phoneNumber: { type: 'string', example: '+919988776655' },
            role: { type: 'string', enum: ['admin', 'employer', 'employee'], nullable: true },
            status: { type: 'string', enum: ['active', 'blocked', 'deleted'] },
            isProfileCompleted: { type: 'boolean', example: false },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['firebaseIdToken'],
          properties: {
            firebaseIdToken: {
              type: 'string',
              description: 'Firebase ID token from client-side authentication',
            },
            deviceToken: {
              type: 'string',
              description: 'FCM device token for push notifications (optional)',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string', description: 'JWT access token (15min)' },
            refreshToken: { type: 'string', description: 'Opaque refresh token (7 days)' },
            isNewUser: { type: 'boolean', description: 'True if the user was just created' },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', description: 'Current valid refresh token' },
          },
        },
        RefreshTokenResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        LogoutRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', description: 'Refresh token to revoke' },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'healthy' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number', example: 12345.67 },
            environment: { type: 'string', example: 'development' },
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'connected' },
                readyState: { type: 'integer', example: 1 },
              },
            },
            memory: {
              type: 'object',
              properties: {
                rss: { type: 'string', example: '45.23 MB' },
                heapUsed: { type: 'string', example: '22.11 MB' },
                heapTotal: { type: 'string', example: '35.50 MB' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/v1/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
