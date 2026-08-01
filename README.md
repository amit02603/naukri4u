# 🚀 Naukri4U — Full-Stack Job Portal & Admin Management System

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Express.js](https://img.shields.io/badge/Express.js-4.18-lightgrey?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Firebase](https://img.shields.io/badge/Firebase-Auth-yellow?style=for-the-badge&logo=firebase)

A full-stack job portal platform featuring a **Production-Ready REST API Backend**, an interactive **Next.js Admin Management Console**, and complete mobile app API integration docs.

---

## 🌐 Live Deployment Links

- **Admin Dashboard**: `https://naukri4u-admin.vercel.app`
- **Backend API Base**: `https://naukri4u-jz3j.onrender.com/api/v1`
- **Interactive Swagger UI**: `https://naukri4u-jz3j.onrender.com/api/docs`

---

## 🏗️ Repository Architecture

```
naukri4u/
├── 📁 job-portal-backend/          # Node.js + Express + TypeScript REST API
│   ├── src/controllers/            # HTTP Request Handlers
│   ├── src/services/               # Business Logic & Manual Entry Services
│   ├── src/repositories/           # Mongoose Data Access Layer (CRUD + Soft Delete)
│   ├── src/routes/v1/              # Versioned Express Routes
│   └── src/config/                 # Swagger, Firebase, MongoDB & Winston Logger
│
├── 📁 job-portal-admin/            # Next.js 16 + TypeScript Admin Web Dashboard
│   ├── app/(auth)/                 # Firebase OTP Authentication Pages
│   ├── app/(dashboard)/            # Dashboard, Employees, Recruiters, Analytics
│   ├── components/                 # Reusable Modals & UI Components
│   └── services/                   # Axios API Client Integration
│
├── 📄 MOBILE_APP_API_DOCUMENTATION.md  # Complete Mobile App Integration Guide
└── 📄 MOBILE_APP_API_DOCUMENTATION.txt # Plain Text Mobile API Docs
```

---

## ✨ Key Features Overview

### 1. 👥 Employee Management
- **Candidate Profiles**: View skills, phone numbers, experience, and resume links.
- **Search & Filter**: Live filter candidates by name, phone, skills, or status (`Active`, `Blocked`).
- **Manual Entry Module**: Admin can manually onboard new candidates.
- **Account Actions**: Edit details, 1-click Block/Unblock toggle, and soft-delete user accounts.

### 2. 🏢 Recruiter Management
- **Company Profiles**: Manage recruiter names, company information, and designations.
- **Manual Entry Module**: Admin can manually register new recruiters and company profiles.
- **Status & Moderation**: Edit details, Block/Unblock, and soft-delete recruiter accounts.

### 3. 📊 Comprehensive Analytics Suite
- **Platform Overview**: Real-time stats for Registrations, Active Users, Recruiters, and Employee counts.
- **Daily Active User Trends**: 30-day activity bar chart for active users & application volume.
- **Monthly Growth Curve**: Recharts area visualization tracking monthly platform growth.
- **Funnel & Breakdown**: Donut charts for job posting status & application conversion (`Applied` ➔ `Shortlisted` ➔ `Hired`).

### 4. 📱 Mobile App Ready APIs
- Firebase Phone OTP Authentication + JWT Access Tokens (15 min) + Refresh Token Rotation (7 days).
- Real-time MongoDB role sync to reflect admin/role changes immediately.
- Comprehensive step-by-step documentation for iOS and Android mobile development teams.

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`
- **MongoDB Atlas** database connection URI
- **Firebase Project** with Phone Authentication enabled

---

### 1. Run Backend API

```bash
cd job-portal-backend
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

The backend server will run at `http://localhost:5000/api/v1` and Swagger docs at `http://localhost:5000/api/docs`.

---

### 2. Run Admin Web Dashboard

```bash
cd job-portal-admin
npm install

# Copy environment template
cp .env.example .env.local

# Start Next.js development server
npm run dev
```

The admin web dashboard will run at `http://localhost:3000`.

---

## 📚 API Documentation References

- 📖 **[Mobile App API Integration Guide (.md)](./MOBILE_APP_API_DOCUMENTATION.md)**
- 📄 **[Mobile App API Integration Guide (.txt)](./MOBILE_APP_API_DOCUMENTATION.txt)**
- 🟢 **[Interactive Swagger UI](https://naukri4u-jz3j.onrender.com/api/docs)**

---

## 🛡️ Security & Quality

- **Helmet**: HTTP Security Headers
- **CORS**: Origin Whitelisting
- **Rate Limiting**: IP-based rate limiting on sensitive auth endpoints
- **Role Synchronization**: Real-time MongoDB role query in auth middleware for instant privilege updates
- **Mobile Responsive**: 100% responsive across desktop, tablet, and smartphones with mobile drawer navigation.

---

## 📝 License

Proprietary — All rights reserved.
