# 🖥️ Naukri4U — Admin Dashboard (Frontend)

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![React Query](https://img.shields.io/badge/TanStack_Query-v5-red?style=for-the-badge&logo=reactquery)
![Recharts](https://img.shields.io/badge/Recharts-v2-blue?style=for-the-badge&logo=chart.js)
![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-v0.4-orange?style=for-the-badge)

The official **Next.js 16 Web Management Console** for Naukri4U Admin users. Built with TypeScript, TanStack React Query, Recharts, and custom Vanilla CSS design tokens matching Naukri4U dark navy + light surface aesthetics.

---

## 🌟 Features & Pages

- **📊 Dashboard Overview (`/`)**: Key metric cards (Users, Recruiters, Jobs, Applications), Applications trend area chart, User distribution donut, quick navigation actions, and recent audit logs.
- **👥 Employee Management (`/employees`)**: Search candidates by name/phone/skills, status filter (`Active`, `Blocked`), **Add Employee** modal, **Edit Details** modal, 1-click **Block/Unblock** toggle, and soft-delete confirmation.
- **🏢 Recruiter Management (`/recruiters`)**: Search recruiters by name/company/designation, **Add Recruiter** modal, **Edit Recruiter & Company Info** modal, **Block/Unblock** toggle, and soft-delete confirmation.
- **📈 Comprehensive Analytics (`/analytics`)**: Real-time stats, 30-day active user activity bar chart, monthly growth curve area chart, job posting status breakdown pie chart, and candidate application status funnel.
- **💼 Jobs & Applications (`/jobs`, `/applications`)**: View all live job postings and applicant submission records.
- **📱 100% Mobile Responsive**: Slide-in mobile drawer menu with backdrop overlay and touch-friendly scrollable data tables.

---

## ⚡ Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the `job-portal-admin` root:

```env
NEXT_PUBLIC_API_URL=https://naukri4u-jz3j.onrender.com/api/v1
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
job-portal-admin/
├── app/
│   ├── (auth)/             # Firebase OTP login & phone verification pages
│   ├── (dashboard)/        # Main dashboard shell layout & modules
│   │   ├── analytics/      # Comprehensive Analytics suite
│   │   ├── applications/   # Candidate job applications list
│   │   ├── employees/      # Employee management & manual onboarding
│   │   ├── jobs/           # Job postings table
│   │   ├── recruiters/     # Recruiter & company management
│   │   ├── users/          # All system users view
│   │   ├── layout.tsx      # Responsive shell layout (Header + Drawer + Profile)
│   │   └── page.tsx        # Dashboard Overview page
│   ├── globals.css         # Custom design tokens, tables & mobile utilities
│   └── layout.tsx          # Root Next.js layout & Providers wrapper
├── components/
│   ├── Modal.tsx           # Reusable modal dialog component
│   └── Providers.tsx       # QueryClientProvider & AuthProvider wrapper
├── hooks/
│   └── useAuth.ts          # Authentication context & Firebase token persistence
├── lib/
│   └── axios.ts            # Axios HTTP client with auto JWT header injection
├── services/
│   ├── adminService.ts     # Admin API client methods
│   └── authService.ts      # Auth API client methods
└── types/                  # TypeScript interface definitions
```

---

## 🚀 Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

Live Dashboard URL: `https://naukri4u-admin.vercel.app`
