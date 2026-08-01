# ⚙️ Naukri4U — Job Portal Backend API

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Express.js](https://img.shields.io/badge/Express.js-4.18-lightgrey?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Firebase](https://img.shields.io/badge/Firebase-Admin-yellow?style=for-the-badge&logo=firebase)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-brightgreen?style=for-the-badge&logo=swagger)

Production-ready REST API backend for the Naukri4U Job Portal platform, built with **Node.js, Express, TypeScript, MongoDB Atlas, and Firebase Admin SDK**.

---

## 🏛️ Clean Architecture

```
Routes ➔ Middleware ➔ Controller ➔ Service ➔ Repository ➔ Mongoose Models ➔ MongoDB Atlas
```

- **Controllers**: Thin HTTP handlers — extract parameters, delegate to services, format JSON responses.
- **Services**: Business logic layer — auth validation, profile upserts, manual entries, stats computation.
- **Repositories**: Data access layer — Mongoose query execution, pagination, soft-deletes (`isDeleted: true`).
- **Middlewares**: Cross-cutting concerns — Firebase token verification, real-time MongoDB role sync, RBAC, input validation chains, rate limiting.

---

## ⚡ Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js (v18+) |
| Language | TypeScript (Strict mode) |
| Web Framework | Express.js |
| Database | MongoDB Atlas + Mongoose 8 |
| Authentication | Firebase Admin SDK + JWT + Refresh Token Rotation |
| File Storage | Cloudinary + Multer |
| Logging | Winston Logger + Morgan HTTP Logger |
| OpenAPI Docs | Swagger UI (`/api/docs`) |
| Security | Helmet, CORS, Rate Limiting, XSS, NoSQL Injection protection |

---

## 📋 Comprehensive API Endpoints

### 🔐 Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/login` | Login with Firebase ID token (returns JWT + Refresh Token) | No |
| `POST` | `/auth/refresh` | Rotate refresh token for new access token | No |
| `POST` | `/auth/logout` | Revoke user session & refresh token | Yes |
| `GET` | `/auth/me` | Fetch currently authenticated user profile | Yes |

### 👤 Roles & Profiles (`/api/v1`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/users/role` | Select initial user role (`employer` or `employee`) | Yes |
| `GET` | `/profiles/me` | Get current user's profile details | Yes |
| `PUT` | `/profiles/employer` | Upsert employer company profile | Employer |
| `PUT` | `/profiles/employee` | Upsert employee candidate profile | Employee |

### 💼 Jobs (`/api/v1/jobs`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/jobs` | Search & list jobs (with pagination & filters) | Public |
| `GET` | `/jobs/:id` | Get job posting details by ID | Public |
| `POST` | `/jobs` | Create a new job posting | Employer / Admin |
| `PUT` | `/jobs/:id` | Update job posting | Employer / Admin |
| `DELETE` | `/jobs/:id` | Soft-delete job posting | Employer / Admin |

### 📝 Applications (`/api/v1/applications`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/applications` | Apply for a job posting | Employee |
| `GET` | `/applications/my` | View my submitted job applications | Employee |
| `GET` | `/applications/jobs/:jobId` | View candidates who applied for a job | Employer / Admin |
| `PATCH` | `/applications/:id/status` | Update candidate application status (`applied`, `shortlisted`, `rejected`, `hired`) | Employer / Admin |

### ⚙️ Admin Console & Manual Entry (`/api/v1/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/admin/dashboard` | Aggregated dashboard stats & chart trends | Admin |
| `GET` | `/admin/analytics` | Comprehensive platform analytics report | Admin |
| `GET` | `/admin/users` | List all registered users (paginated) | Admin |
| `GET` | `/admin/recruiters` | List all recruiter profiles (paginated) | Admin |
| `GET` | `/admin/employees` | List all employee profiles (paginated) | Admin |
| `POST` | `/admin/employees` | Manually onboard a new candidate | Admin |
| `POST` | `/admin/recruiters` | Manually onboard a new recruiter + company | Admin |
| `PUT` | `/admin/employees/:id` | Admin edit candidate profile | Admin |
| `PUT` | `/admin/recruiters/:id` | Admin edit recruiter & company details | Admin |
| `PATCH` | `/admin/users/:id/status` | Block, unblock, or activate user account | Admin |
| `DELETE` | `/admin/users/:id` | Soft-delete user account | Admin |
| `PATCH` | `/admin/jobs/:id/status` | Job posting moderation status update | Admin |

---

## ⚡ Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and provide your credentials:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/naukri4u
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_min_32_chars
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 3. Run Server

```bash
# Development (hot-reload)
npm run dev

# Production build
npm run build
npm start
```

Interactive Swagger UI runs at: `http://localhost:5000/api/docs`

---

## 🌐 Production Deployment (Render)

Render deployment configuration is included. Production Base API:
`https://naukri4u-jz3j.onrender.com/api/v1`

---

## 📝 License

Proprietary — All rights reserved.
