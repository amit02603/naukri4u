# Naukri4U — Mobile App API Documentation

Comprehensive step-by-step integration guide for the Mobile App development team.

---

## 🌐 Base Server URLs

- **Production URL**: `https://naukri4u-backend.onrender.com/api/v1`
- **Local Dev URL**: `http://localhost:5000/api/v1`

---

## 🔑 Authentication & Headers

For protected endpoints, include the JWT access token in the `Authorization` header:

```http
Authorization: Bearer <accessToken>
Content-Type: application.json
```

---

## 📱 SECTION 1: AUTHENTICATION FLOW

### 1.1 Login with Firebase OTP Token
Exchanges Firebase ID Token for a short-lived JWT access token and a long-lived refresh token.

- **Endpoint**: `POST /auth/login`
- **Authentication**: Public (No header required)

#### Request Body:
```json
{
  "firebaseIdToken": "eyJhbGciOiJSUzI1NiIs...",
  "deviceToken": "fcm_device_token_string_optional"
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "66b3f9d8...",
      "firebaseUid": "Gj0R3iCNj3M...",
      "phoneNumber": "+919988776655",
      "role": "employer",
      "status": "active",
      "isProfileCompleted": true,
      "lastLogin": "2026-08-01T14:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "c61b626e-48a0-4a81-9b1b-..."
  }
}
```

---

### 1.2 Refresh Access Token
Issues a new JWT access token when the current access token expires.

- **Endpoint**: `POST /auth/refresh`
- **Authentication**: Public

#### Request Body:
```json
{
  "refreshToken": "c61b626e-48a0-4a81-9b1b-..."
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "e72c737f-59b1-5b92-0c2c-..."
  }
}
```

---

### 1.3 Logout
Revokes the refresh token and ends the session.

- **Endpoint**: `POST /auth/logout`
- **Authentication**: Protected (`Bearer <accessToken>`)

#### Request Body:
```json
{
  "refreshToken": "e72c737f-59b1-5b92-0c2c-..."
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.4 Get Current User Profile (`Get Me`)
Returns the logged-in user's account status and role.

- **Endpoint**: `GET /auth/me`
- **Authentication**: Protected (`Bearer <accessToken>`)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "id": "66b3f9d8...",
    "firebaseUid": "Gj0R3iCNj3M...",
    "phoneNumber": "+919988776655",
    "role": "employee",
    "status": "active",
    "isProfileCompleted": true
  }
}
```

---

## 👤 SECTION 2: ROLE SELECTION & PROFILES

### 2.1 Select User Role
Newly registered users must select whether they are an **employer** (recruiter) or **employee** (candidate).

- **Endpoint**: `POST /users/role`
- **Authentication**: Protected (`Bearer <accessToken>`)

#### Request Body:
```json
{
  "role": "employer"
}
```
*(Valid roles: `"employer"` or `"employee"`)*

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "id": "66b3f9d8...",
    "phoneNumber": "+919988776655",
    "role": "employer",
    "isProfileCompleted": false
  }
}
```

---

### 2.2 Get My Profile
Fetches profile details for the logged-in user.

- **Endpoint**: `GET /profiles/me`
- **Authentication**: Protected (`Bearer <accessToken>`)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "user": {
      "id": "66b3f9d8...",
      "phoneNumber": "+919988776655",
      "role": "employer",
      "isProfileCompleted": true
    },
    "profile": {
      "id": "6701a2b3...",
      "userId": "66b3f9d8...",
      "name": "Rahul Sharma",
      "company": "Arohar Technologies",
      "designation": "HR Lead"
    }
  }
}
```

---

### 2.3 Save / Update Employer (Recruiter) Profile
- **Endpoint**: `PUT /profiles/employer`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: `employer` or `admin`)

#### Request Body:
```json
{
  "name": "Rahul Sharma",
  "company": "Arohar Technologies",
  "designation": "Talent Acquisition Lead"
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Employer profile saved successfully",
  "data": {
    "id": "6701a2b3...",
    "userId": "66b3f9d8...",
    "name": "Rahul Sharma",
    "company": "Arohar Technologies",
    "designation": "Talent Acquisition Lead"
  }
}
```

---

### 2.4 Save / Update Employee (Candidate) Profile
- **Endpoint**: `PUT /profiles/employee`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: `employee` or `admin`)

#### Request Body:
```json
{
  "name": "amit Rawat",
  "phone": "7668942630",
  "skills": "React, Node.js, MongoDB, TypeScript",
  "experience": "3 Years",
  "resumeUrl": "https://storage.naukri4u.com/resumes/amit_resume.pdf"
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Employee profile saved successfully",
  "data": {
    "id": "6702c4d5...",
    "userId": "66b3f9d8...",
    "name": "amit mundra",
    "phone": "7668942630",
    "skills": "React, Node.js, MongoDB, TypeScript",
    "experience": "3 Years",
    "resumeUrl": "https://storage.naukri4u.com/resumes/amit_resume.pdf"
  }
}
```

---

## 💼 SECTION 3: JOB POSTINGS & SEARCH

### 3.1 Search & List Jobs
Used by candidates to search for jobs, or recruiters to view listings.

- **Endpoint**: `GET /jobs`
- **Authentication**: Public or Protected (Optional)
- **Query Parameters**:
  - `page` (number, default `1`)
  - `limit` (number, default `20`)
  - `search` (string, searches title/company/location)
  - `status` (string: `"active"`, `"pending"`, `"closed"`)
  - `company` (string)

#### Example Request: `GET /jobs?search=Developer&page=1&limit=10`

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Jobs fetched successfully",
  "data": [
    {
      "id": "6703e5f6...",
      "title": ".NET Developer",
      "company": "Arohar Technologies",
      "location": "Noida / Remote",
      "description": "We are hiring a Senior .NET Core Developer...",
      "salary": "8 - 12 LPA",
      "status": "active",
      "postedBy": "66b3f9d8...",
      "createdAt": "2026-08-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 3.2 Get Job Details by ID
- **Endpoint**: `GET /jobs/:id`
- **Authentication**: Public or Protected (Optional)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Job details fetched successfully",
  "data": {
    "id": "6703e5f6...",
    "title": ".NET Developer",
    "company": "Arohar Technologies",
    "location": "Noida / Remote",
    "description": "We are hiring a Senior .NET Core Developer...",
    "salary": "8 - 12 LPA",
    "status": "active",
    "postedBy": "66b3f9d8...",
    "createdAt": "2026-08-01T10:00:00.000Z"
  }
}
```

---

### 3.3 Create Job Posting
- **Endpoint**: `POST /jobs`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: `employer` or `admin`)

#### Request Body:
```json
{
  "title": "Full Stack Developer",
  "company": "TechSoft Solutions",
  "location": "Bangalore",
  "description": "Looking for Full Stack MERN engineer with 2+ yrs exp...",
  "salary": "10 - 15 LPA",
  "status": "active"
}
```

#### Success Response (`201 Created`):
```json
{
  "success": true,
  "message": "Job posting created successfully",
  "data": {
    "id": "6704f6a7...",
    "title": "Full Stack Developer",
    "company": "TechSoft Solutions",
    "location": "Bangalore",
    "description": "Looking for Full Stack MERN engineer with 2+ yrs exp...",
    "salary": "10 - 15 LPA",
    "status": "active",
    "postedBy": "66b3f9d8...",
    "createdAt": "2026-08-01T14:45:00.000Z"
  }
}
```

---

### 3.4 Update Job Posting
- **Endpoint**: `PUT /jobs/:id`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: Posting `employer` or `admin`)

#### Request Body:
```json
{
  "title": "Senior Full Stack Developer",
  "salary": "12 - 18 LPA",
  "status": "active"
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Job posting updated successfully",
  "data": { ... }
}
```

---

### 3.5 Delete Job Posting
- **Endpoint**: `DELETE /jobs/:id`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: Posting `employer` or `admin`)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Job posting deleted successfully",
  "data": null
}
```

---

## 📄 SECTION 4: JOB APPLICATIONS WORKFLOW

### 4.1 Apply to a Job (Candidate)
Candidates apply for an active job using a 1-click submission with their resume URL.

- **Endpoint**: `POST /applications`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: `employee` or `admin`)

#### Request Body:
```json
{
  "jobId": "6703e5f6...",
  "resumeUrl": "https://storage.naukri4u.com/resumes/amit_resume.pdf"
}
```

#### Success Response (`201 Created`):
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": "6705a7b8...",
    "applicant": "66b3f9d8...",
    "job": "6703e5f6...",
    "status": "applied",
    "resumeUrl": "https://storage.naukri4u.com/resumes/amit_resume.pdf",
    "createdAt": "2026-08-01T14:50:00.000Z"
  }
}
```

---

### 4.2 View My Applications (Candidate History)
Candidate tracks the status of all jobs they have applied for.

- **Endpoint**: `GET /applications/my`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: `employee` or `admin`)
- **Query Parameters**: `page=1`, `limit=20`

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Applications fetched successfully",
  "data": [
    {
      "id": "6705a7b8...",
      "job": {
        "id": "6703e5f6...",
        "title": ".NET Developer",
        "company": "Arohar Technologies",
        "location": "Noida / Remote"
      },
      "status": "shortlisted",
      "resumeUrl": "https://storage.naukri4u.com/resumes/amit_resume.pdf",
      "createdAt": "2026-08-01T14:50:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 4.3 View Applicants for a Job (Recruiter)
Recruiters view candidates who applied for their specific job posting.

- **Endpoint**: `GET /applications/jobs/:jobId`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: Job Posting `employer` or `admin`)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Job applications fetched successfully",
  "data": [
    {
      "id": "6705a7b8...",
      "applicant": {
        "id": "66b3f9d8...",
        "phoneNumber": "+917668942630"
      },
      "status": "applied",
      "resumeUrl": "https://storage.naukri4u.com/resumes/amit_resume.pdf",
      "createdAt": "2026-08-01T14:50:00.000Z"
    }
  ]
}
```

---

### 4.4 Update Candidate Application Status (Recruiter)
Recruiter updates candidate application status (`applied` ➔ `shortlisted` / `rejected` / `hired`).

- **Endpoint**: `PATCH /applications/:id/status`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: Job Posting `employer` or `admin`)

#### Request Body:
```json
{
  "status": "shortlisted"
}
```
*(Valid statuses: `"applied"`, `"shortlisted"`, `"rejected"`, `"hired"`)*

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "id": "6705a7b8...",
    "status": "shortlisted"
  }
}
```

---

## ⚙️ SECTION 5: ADMIN MANAGEMENT, MANUAL ENTRY & ANALYTICS

### 5.1 Admin Manual Entry — Create Employee
Admin manually registers a new candidate account & profile.

- **Endpoint**: `POST /admin/employees`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: `admin`)

#### Request Body:
```json
{
  "phoneNumber": "+919876543210",
  "name": "Amit Mundra",
  "skills": "React, Node.js, MongoDB",
  "experience": "2 Years"
}
```

#### Success Response (`201 Created`):
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "user": {
      "id": "66b3f9d8...",
      "phoneNumber": "+919876543210",
      "role": "employee",
      "status": "active",
      "isProfileCompleted": true
    },
    "profile": {
      "id": "6702c4d5...",
      "name": "Amit Mundra",
      "skills": "React, Node.js, MongoDB",
      "experience": "2 Years"
    }
  }
}
```

---

### 5.2 Admin Manual Entry — Create Recruiter
Admin manually registers a new recruiter account & company profile.

- **Endpoint**: `POST /admin/recruiters`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: `admin`)

#### Request Body:
```json
{
  "phoneNumber": "+919988776655",
  "name": "Rahul Sharma",
  "company": "Arohar Technologies",
  "designation": "HR Lead"
}
```

#### Success Response (`201 Created`):
```json
{
  "success": true,
  "message": "Recruiter created successfully",
  "data": {
    "user": {
      "id": "66b3f9d8...",
      "phoneNumber": "+919988776655",
      "role": "employer",
      "status": "active",
      "isProfileCompleted": true
    },
    "profile": {
      "id": "6701a2b3...",
      "name": "Rahul Sharma",
      "company": "Arohar Technologies",
      "designation": "HR Lead"
    }
  }
}
```

---

### 5.3 Admin Edit Employee Details
- **Endpoint**: `PUT /admin/employees/:id`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: `admin`)

#### Request Body:
```json
{
  "name": "Amit Mundra",
  "phone": "+919876543210",
  "skills": "TypeScript, React, Express, MongoDB",
  "experience": "3 Years"
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Employee profile updated successfully",
  "data": { ... }
}
```

---

### 5.4 Admin Edit Recruiter & Company Details
- **Endpoint**: `PUT /admin/recruiters/:id`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: `admin`)

#### Request Body:
```json
{
  "name": "Rahul Sharma",
  "company": "Arohar Enterprise Solutions",
  "designation": "VP of Talent Acquisition"
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Recruiter profile updated successfully",
  "data": { ... }
}
```

---

### 5.5 Admin Block / Unblock / Delete User Account
- **Endpoint**: `PATCH /admin/users/:id/status`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: `admin`)

#### Request Body:
```json
{
  "status": "blocked"
}
```
*(Valid statuses: `"active"`, `"blocked"`, `"deleted"`)*

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": { ... }
}
```

---

### 5.6 Admin Soft-Delete User
- **Endpoint**: `DELETE /admin/users/:id`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: `admin`)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

---

### 5.7 Admin Job Posting Status Moderation
- **Endpoint**: `PATCH /admin/jobs/:id/status`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: `admin`)

#### Request Body:
```json
{
  "status": "active"
}
```
*(Valid statuses: `"active"`, `"pending"`, `"closed"`)*

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Job status updated successfully",
  "data": { ... }
}
```

---

### 5.8 Admin Comprehensive Analytics Report
- **Endpoint**: `GET /admin/analytics`
- **Authentication**: Protected (`Bearer <accessToken>`, Role: `admin`)

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Comprehensive analytics fetched successfully",
  "data": {
    "overview": {
      "totalRegistrations": 120,
      "activeUsers": 115,
      "totalRecruiters": 35,
      "totalEmployees": 85
    },
    "growth": {
      "employeeTrend": [ { "month": "Jan", "count": 10 }, { "month": "Feb", "count": 18 } ],
      "jobTrend": [ { "month": "Jan", "count": 5 }, { "month": "Feb", "count": 12 } ]
    },
    "dailyActivity": [
      { "date": "Aug 1", "activeUsers": 45, "applications": 12 }
    ],
    "jobStats": [
      { "status": "active", "count": 28 },
      { "status": "closed", "count": 4 }
    ],
    "applicationStats": [
      { "status": "applied", "count": 65 },
      { "status": "shortlisted", "count": 14 },
      { "status": "hired", "count": 8 }
    ]
  }
}
```

---

## 🛠️ SECTION 6: ERROR HANDLING & RESPONSES

All API error responses follow a standard unified format:

#### 400 Bad Request / Validation Failure:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Job title is required"
    }
  ]
}
```

#### 401 Unauthorized:
```json
{
  "success": false,
  "message": "Access token is required"
}
```

#### 403 Forbidden:
```json
{
  "success": false,
  "message": "Access denied. Required role: employer or admin. Your role: employee"
}
```

#### 404 Not Found:
```json
{
  "success": false,
  "message": "Job posting not found"
}
```

