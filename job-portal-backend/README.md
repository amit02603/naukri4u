# Job Portal Backend

Job Portal Backend API built with Node.js, Express, TypeScript, and MongoDB.

## Architecture

```
Clean Architecture with Repository Pattern
┌──────────────────────────────────────────────┐
│  Routes → Controller → Service → Repository  │
│              ↓                       ↓        │
│         Middleware              Mongoose       │
│              ↓                       ↓        │
│       Validation            MongoDB Atlas     │
└──────────────────────────────────────────────┘
```

- **Controllers**: Thin — extract request data, delegate to services, return responses
- **Services**: Business logic — auth flows, validation rules, data transformations
- **Repositories**: Data access — Mongoose queries, CRUD operations, soft-delete
- **Middlewares**: Cross-cutting concerns — auth, RBAC, validation, rate limiting, logging

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Language | TypeScript (strict mode) |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose 8) |
| Auth | Firebase Admin SDK + JWT + Refresh Tokens |
| Uploads | Cloudinary + Multer |
| Logging | Winston + Morgan |
| Docs | Swagger/OpenAPI 3.0 |
| Testing | Jest + Supertest + MongoDB Memory Server |
| Security | Helmet, CORS, Rate Limiting, XSS, NoSQL Injection |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- MongoDB Atlas account (or local MongoDB for development)
- Firebase project with Phone Authentication enabled

### Installation

```bash
# Clone the repository
git clone <repo-url> job-portal-backend
cd job-portal-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Fill in your credentials in .env
# See .env.example for documentation on each variable
```

### Environment Variables

See [`.env.example`](.env.example) for the complete list with descriptions.

Key variables:
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Secret for signing JWTs (min 32 chars)
- `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` — Firebase Admin SDK credentials

### Running

```bash
# Development (hot-reload)
npm run dev

# Production build
npm run build
npm start

# Docker
docker-compose up --build
```

### Testing

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# With coverage
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run lint:fix
npm run format
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Firebase ID token → JWT + Refresh Token | No |
| POST | `/api/v1/auth/refresh` | Rotate refresh token | No |
| POST | `/api/v1/auth/logout` | Revoke refresh token | Yes |
| GET | `/api/v1/auth/me` | Get current user | Yes |

### System

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/health` | Health check | No |

### Swagger Documentation

Available at `http://localhost:5000/api/docs` in development mode.

## API Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {}
}
```

### Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "phoneNumber", "message": "Phone number is required" }
  ]
}
```

## Project Structure

```
src/
├── config/        # Database, Firebase, Cloudinary, Logger, Swagger
├── constants/     # Roles, permissions, HTTP status codes
├── controllers/   # Thin request handlers
├── helpers/       # Response formatter, pagination, token generation
├── interfaces/    # TypeScript interfaces and enums
├── middlewares/    # Auth, RBAC, validation, rate limiting, error handling
├── models/        # Mongoose schemas
├── repositories/  # Data access layer (CRUD + soft-delete)
├── routes/        # Versioned API routes with Swagger annotations
├── services/      # Business logic
├── utils/         # ApiError, asyncHandler
├── app.ts         # Express application factory
└── server.ts      # Entry point with graceful shutdown
```

## Security

- **Helmet** — HTTP security headers
- **CORS** — Origin whitelisting
- **Rate Limiting** — Global + endpoint-specific limiters
- **NoSQL Injection** — Request sanitization via express-mongo-sanitize
- **XSS** — Input sanitization via xss library
- **HPP** — HTTP Parameter Pollution protection
- **JWT** — Short-lived access tokens (15min)
- **Refresh Token Rotation** — Tokens rotated on each use, reuse detection
- **Soft Delete** — No permanent data deletion

## Deployment

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Docker

```bash
docker build -t job-portal-backend .
docker run -p 5000:5000 --env-file .env job-portal-backend
```

## License

Proprietary — All rights reserved.
