# StaffRoom PHP API Documentation

**Version:** 1.0.0  
**Base URL:** `https://api.staffroomng.com/api`  
**Health Check URL:** `https://api.staffroomng.com/health`  
**Architecture:** Custom PHP MVC Framework with MySQL, PDO, and JWT Authentication  

---

## 1. Project Overview
StaffRoom is a premier teaching job marketplace API built on a clean, custom PHP MVC architecture (`Controller`, `Model`, `Database`, and `ResponseHelper`). The platform connects teaching professionals with schools through secure, role-based workflows:
- **Teachers (`role: teacher`)**: Create personal profiles, upload CVs (`pdf`, `doc`, `docx`), browse and search teaching vacancies, bookmark/save jobs, and submit applications with customized cover letters.
- **Schools (`role: school`)**: Create institutional profiles, upload logos (`jpg`, `png`, `webp`), publish and manage job listings, review teacher applications, and update hiring statuses.
- **Administrators (`role: admin`)**: Oversee platform activity, view global operational statistics, and process school verification requests to maintain trust across the marketplace.

### Key Architectural & Security Rules:
- **String User Identifiers (`user_id`)**: The platform strictly uses `user_id` (e.g., `USR-2026-000001`) as the primary public and database identifier across all entities. Auto-increment integer `id` keys (`users.id`) are never exposed or relied upon in business logic or API responses.
- **6-Digit Email Verification Code**: When a user registers, a secure 6-digit verification code is generated, hashed with bcrypt (`password_hash`), stored in the database with a 10-minute expiration, and sent to the recipient's email address via PHPMailer (`SMTP/SSL`). Users enter this code on the frontend (`POST /auth/verify-email`) before login is permitted.
- **Zero Password Exposure**: Passwords, hashed verification codes, and internal auto-increment IDs are excluded (`unset`) from all user object representations across all endpoints.
- **Stateless JWT Authentication**: Authenticated sessions rely on JSON Web Tokens (`JWT`) signed securely with `HMAC-SHA256` and expire according to `JWT_EXPIRES_IN` (the example configuration is 30 days).

### Demo Database Accounts

The supplied SQL dump includes verified demo accounts for immediate testing:

| Role | Email | Password |
|---|---|---|
| Teacher | `teacher@staffroom.test` | `TeacherPass123!` |
| School | `school@staffroom.test` | `SchoolPass123!` |
| Admin | `admin@staffroom.test` | `AdminPass123!` |

These credentials are for local/development testing only and must not be used in production.

---

## 2. Authentication Guide
Protected endpoints require an active, valid JSON Web Token (`JWT`) passed in the `Authorization` HTTP header using the `Bearer` schema:

```http
Authorization: Bearer <your_jwt_token_here>
```

### JWT Payload Structure
Upon successful login (or verification), the generated JWT payload adheres strictly to the following schema:
```json
{
  "user_id": "USR-2026-000001",
  "email": "jane@staffroom.ng",
  "role": "teacher",
  "exp": 1783640000
}
```

---

## 3. Standard Response Format
The API maintains a strict, unified JSON structure (`application/json`) across every response.

### Success Response Structure
```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    "key": "value"
  }
}
```

### Error Response Structure
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "password": "password must be at least 6 characters"
  }
}
```

---

## 4. Status Codes
The API returns exact HTTP status codes corresponding to operational outcomes:
- **`200 OK`**: The request succeeded, and data/confirmation is returned.
- **`201 Created`**: A resource (User, Job, Application) was successfully created.
- **`204 No Content`**: Resource successfully processed or deleted with no response body.
- **`400 Validation Error`**: Malformed request or validation failure (e.g., missing fields, invalid code).
- **`401 Unauthenticated`**: Missing, invalid, or expired JWT token, or incorrect login credentials.
- **`403 Unauthorized`**: Insufficient permissions (e.g., teacher attempting to post a job) or unverified email address.
- **`404 Not Found`**: The requested resource (Job, Profile, Application) does not exist.
- **`409 Conflict`**: Duplicate resource (e.g., email already registered, application already submitted).
- **`500 Server Error`**: Internal database or server processing error.

---

## 5. Auth Endpoints

### `POST /auth/register`
Registers a new public user with a public role of `teacher` or `school`. Admin registration is rejected.
- **Method:** `POST`
- **URL:** `https://api.staffroomng.com/api/auth/register`
- **Authentication Requirement:** No (Public)
- **Allowed Public Roles:** `teacher`, `school`

#### Request Body (`application/json`)
```json
{
  "full_name": "Jane Teacher",
  "email": "jane@staffroom.ng",
  "phone": "08000000000",
  "password": "password123",
  "role": "teacher"
}
```

#### Sample Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for the 6-digit verification code.",
  "data": {
    "user": {
      "user_id": "USR-2026-000001",
      "full_name": "Jane Teacher",
      "email": "jane@staffroom.ng",
      "email_verified": false,
      "phone": "08000000000",
      "role": "teacher",
      "status": "pending",
      "created_at": "2026-07-10 00:00:00",
      "updated_at": "2026-07-10 00:00:00"
    },
    "email_verified": false
  }
}
```

#### Sample Error Response — Invalid Admin Role (`400 Validation Error`)
```json
{
  "success": false,
  "message": "Invalid account type selected."
}
```

#### Sample Error Response — Missing Role (`400 Validation Error`)
```json
{
  "success": false,
  "message": "role is required"
}
```

---

### `POST /auth/login`
Authenticates a user and issues a JWT token if their email is verified.
- **Method:** `POST`
- **URL:** `https://api.staffroomng.com/api/auth/login`
- **Authentication Requirement:** No (Public)
- **Allowed Role:** Any

#### Request Body (`application/json`)
```json
{
  "email": "jane@staffroom.ng",
  "password": "password123"
}
```

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": "USR-2026-000001",
      "full_name": "Jane Teacher",
      "email": "jane@staffroom.ng",
      "email_verified": true,
      "phone": "08000000000",
      "role": "teacher",
      "status": "active",
      "created_at": "2026-07-10 00:00:00",
      "updated_at": "2026-07-10 00:00:00"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiVVNSLTIwMjYtMDAwMDAxIiwiZW1haWwiOiJqYW5lQHN0YWZmcm9vbS5uZyIsInJvbGUiOiJ0ZWFjaGVyIiwiZXhwIjoxNzgzNjQwMDAwfQ.signature..."
  }
}
```

#### Sample Error Response — Unverified Email (`403 Unauthorized`)
```json
{
  "success": false,
  "message": "Please verify your email before logging in."
}
```

#### Sample Error Response — Unverified Email (`403 Unauthorized`)
```json
{
  "success": false,
  "message": "Please verify your email before logging in."
}
```

#### Sample Error Response — Deleted Account (`403 Unauthorized`)
```json
{
  "success": false,
  "message": "This account has been deleted."
}
```

#### Sample Error Response — Invalid Credentials (`401 Unauthenticated`)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### `POST /auth/verify-email`
Verifies a user's email address by validating the submitted 6-digit code against the hashed code stored in the database.
- **Method:** `POST`
- **URL:** `https://api.staffroomng.com/api/auth/verify-email`
- **Authentication Requirement:** No (Public)
- **Allowed Role:** Any

#### Request Body (`application/json`)
```json
{
  "email": "jane@staffroom.ng",
  "code": "123456"
}
```

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user_id": "USR-2026-000001",
    "email_verified": true
  }
}
```

#### Sample Error Response — Expired Code (`400 Validation Error`)
```json
{
  "success": false,
  "message": "Verification code has expired. Please request a new code."
}
```

---

### `POST /auth/resend-verification`
Generates a fresh 6-digit verification code, hashes it, saves it to the database with a new 10-minute expiry, and sends it via PHPMailer.
- **Method:** `POST`
- **URL:** `https://api.staffroomng.com/api/auth/resend-verification`
- **Authentication Requirement:** No (Public)
- **Allowed Role:** Any

### `DELETE /auth/delete-account`
Deletes the currently authenticated user's account using a soft delete.
- **Method:** `DELETE`
- **URL:** `https://api.staffroomng.com/api/auth/delete-account`
- **Authentication Requirement:** Bearer token required
- **Optional Body:**
```json
{
  "password": "user_password"
}
```
- **Success Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully."
}
```
- **Incorrect Password Response:**
```json
{
  "success": false,
  "message": "Incorrect password."
}
```

#### Request Body (`application/json`)
```json
{
  "email": "jane@staffroom.ng"
}
```

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "A new 6-digit verification code has been sent to your email address.",
  "data": []
}
```

#### Sample Error Response (`400 Validation Error`)
```json
{
  "success": false,
  "message": "A valid email address is required"
}
```

---

## 6. Jobs Endpoints

### `GET /jobs`
Retrieves open job vacancies. Teachers can view all open jobs; schools can view only their own open jobs. Supports optional query filters by `subject` and `state`.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/api/jobs?subject=Mathematics&state=Lagos`
- **Authentication Requirement:** Yes (`Authorization: Bearer <token>`)
- **Allowed Role:** `teacher` or `school`

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": {
    "jobs": [
      {
        "job_id": "JOB-2026-001",
        "school_id": "USR-2026-000002",
        "title": "Math Teacher",
        "description": "Looking for a qualified mathematics teacher for senior secondary school.",
        "role_type": "Mathematics Teacher",
        "employment_type": "full-time",
        "salary_range": "100k-150k",
        "location": "Lagos",
        "requirements": "BSc Mathematics with at least 3 years teaching experience.",
        "status": "open",
        "created_at": "2026-07-10 00:10:00",
        "updated_at": "2026-07-10 00:10:00",
        "school_name": "Bright Future Academy",
        "school_logo": "https://api.staffroomng.com/uploads/logos/bright_future.png"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_items": 1,
      "total_pages": 1
    }
  }
}
```

#### Sample Error Response (`500 Server Error`)
```json
{
  "success": false,
  "message": "Failed to retrieve jobs"
}
```

---

### `GET /jobs/{job_id}`
Retrieves full details for a single job vacancy identified by `job_id`. Teachers can view open jobs from any school; schools can view only jobs they created.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/api/jobs/1`
- **Authentication Requirement:** Yes (`Authorization: Bearer <token>`)
- **Allowed Role:** `teacher` or `school`

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Job details retrieved successfully",
  "data": {
    "job": {
      "job_id": "JOB-2026-001",
      "school_id": "USR-2026-000002",
      "title": "Math Teacher",
      "description": "Looking for a qualified mathematics teacher for senior secondary school.",
      "role_type": "Mathematics Teacher",
      "employment_type": "full-time",
      "salary_range": "100k-150k",
      "location": "Lagos",
      "requirements": "BSc Mathematics with at least 3 years teaching experience.",
      "status": "active",
      "created_at": "2026-07-10 00:10:00",
      "updated_at": "2026-07-10 00:10:00"
    }
  }
}
```

#### Sample Error Response (`404 Not Found`)
```json
{
  "success": false,
  "message": "Job not found."
}
```

---

### `POST /jobs`
Creates and publishes a new job vacancy.
- **Method:** `POST`
- **URL:** `https://api.staffroomng.com/api/jobs`
- **Authentication Requirement:** Yes (`Authorization: Bearer <schoolToken>`)
- **Allowed Role:** `school`

#### Request Body (`application/json`)
```json
{
  "title": "Math Teacher",
  "description": "Looking for a math teacher",
  "role_type": "Mathematics Teacher",
  "employment_type": "full-time",
  "salary_range": "100k-150k",
  "location": "Lagos",
  "requirements": "BSc Mathematics",
  "teaching_level": "SS1 - SS3",
  "required_experience": "5+ years",
  "required_qualification": "B.Ed, TRCN Certification",
  "application_deadline": "2026-10-31",
  "is_featured": false,
  "status": "open"
}
```

#### Sample Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "job_id": "JOB-2026-001",
    "title": "Math Teacher",
    "status": "active"
  }
}
```

#### Sample Error Response (`403 Unauthorized`)
```json
{
  "success": false,
  "message": "Access denied. School role required."
}
```

---

### `PUT /jobs/{job_id}`
Updates an existing job posting. Only the school that created the job can modify it.
- **Method:** `PUT`
- **URL:** `https://api.staffroomng.com/api/jobs/1`
- **Authentication Requirement:** Yes (`Authorization: Bearer <schoolToken>`)
- **Allowed Role:** `school` (Must be owner of the job)

#### Request Body (`application/json`)
```json
{
  "title": "Senior Math Teacher",
  "description": "Updated job description for senior mathematics teacher.",
  "role_type": "Mathematics Teacher",
  "employment_type": "full-time",
  "salary_range": "150k-200k",
  "location": "Lagos",
  "requirements": "BSc Mathematics with 5 years experience."
}
```

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": {
    "job_id": "JOB-2026-001"
  }
}
```

#### Sample Error Response (`403 Unauthorized`)
```json
{
  "success": false,
  "message": "You do not have permission to modify this job."
}
```

---

### `DELETE /jobs/{job_id}`
Deletes a job posting and cascades deletion across related applications. Only the school owner can delete.
- **Method:** `DELETE`
- **URL:** `https://api.staffroomng.com/api/jobs/1`
- **Authentication Requirement:** Yes (`Authorization: Bearer <schoolToken>`)
- **Allowed Role:** `school` (Must be owner of the job)

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Job deleted successfully",
  "data": []
}
```

#### Sample Error Response (`404 Not Found`)
```json
{
  "success": false,
  "message": "Job not found or already deleted."
}
```

---

## 7. Applications Endpoints

### `POST /applications/apply/{job_id}`
Submits a teacher's application for a specific job vacancy (`job_id`). Prevents duplicate submissions (`409 Conflict`).
- **Method:** `POST`
- **URL:** `https://api.staffroomng.com/api/applications/apply/1`
- **Authentication Requirement:** Yes (`Authorization: Bearer <teacherToken>`)
- **Allowed Role:** `teacher`

#### Request Body (`application/json`)
```json
{
  "cover_letter": "I am highly interested in this role."
}
```

#### Sample Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application_id": "APP-2026-001",
    "job_id": "JOB-2026-001",
    "teacher_id": "USR-2026-000001",
    "status": "pending"
  }
}
```

#### Sample Error Response (`409 Conflict`)
```json
{
  "success": false,
  "message": "You have already applied for this job."
}
```

---

### `GET /applications/my-applications`
Retrieves all applications submitted by the authenticated teacher.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/api/applications/my-applications`
- **Authentication Requirement:** Yes (`Authorization: Bearer <teacherToken>`)
- **Allowed Role:** `teacher`

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "applications": [
      {
        "application_id": "APP-2026-001",
        "job_id": "JOB-2026-001",
        "teacher_id": "USR-2026-000001",
        "cover_letter": "I am highly interested in this role...",
        "status": "shortlisted",
        "created_at": "2026-07-10 00:15:00",
        "job_title": "Math Teacher",
        "school_name": "Bright Future Academy",
        "location": "Lagos",
        "salary_range": "100k-150k"
      }
    ]
  }
}
```

#### Sample Error Response (`401 Unauthenticated`)
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### `GET /applications/job/{job_id}`
Retrieves all teacher applications submitted for a specific job vacancy owned by the authenticated school.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/api/applications/job/1`
- **Authentication Requirement:** Yes (`Authorization: Bearer <schoolToken>`)
- **Allowed Role:** `school` (Must own the job)

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "applications": [
      {
        "application_id": "APP-2026-001",
        "job_id": "JOB-2026-001",
        "teacher_id": "USR-2026-000001",
        "cover_letter": "I am highly interested in this role...",
        "status": "pending",
        "created_at": "2026-07-10 00:15:00",
        "teacher_name": "Jane Teacher",
        "teacher_email": "jane@staffroom.ng",
        "teacher_phone": "08000000000",
        "cv_url": "https://api.staffroomng.com/uploads/cvs/jane_cv.pdf"
      }
    ]
  }
}
```

#### Sample Error Response (`403 Unauthorized`)
```json
{
  "success": false,
  "message": "You do not have permission to view applications for this job."
}
```

---

### `PATCH /applications/{application_id}/status`
Updates the recruitment workflow status of an application.
- **Method:** `PATCH`
- **URL:** `https://api.staffroomng.com/api/applications/1/status`
- **Authentication Requirement:** Yes (`Authorization: Bearer <schoolToken>`)
- **Allowed Role:** `school` (Must own the job associated with the application)
- **Allowed Statuses:** `pending`, `reviewed`, `shortlisted`, `rejected`, `hired`

#### Request Body (`application/json`)
```json
{
  "status": "shortlisted"
}
```

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "application_id": "APP-2026-001",
    "status": "shortlisted"
  }
}
```

#### Sample Error Response (`400 Validation Error`)
```json
{
  "success": false,
  "message": "Invalid status specified. Must be one of: pending, reviewed, shortlisted, rejected, hired"
}
```

---

## 8. Profile Endpoints

### `GET /profiles/me`
Retrieves the combined user account details and role-specific profile (`teacher_profiles` or `school_profiles`) for the currently authenticated user.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/api/profiles/me`
- **Authentication Requirement:** Yes (`Authorization: Bearer <token>`)
- **Allowed Role:** Any (`teacher`, `school`, or `admin`)

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "user_id": "USR-2026-000001",
      "full_name": "Jane Teacher",
      "email": "jane@staffroom.ng",
      "phone": "08000000000",
      "role": "teacher",
      "status": "active"
    },
    "profile": {
      "user_id": "USR-2026-000001",
      "bio": "Passionate educator with over 5 years experience.",
      "skills": "Math, Science, Curriculum Development",
      "experience_years": 5,
      "location": "Lagos",
      "cv_url": "https://api.staffroomng.com/uploads/cvs/jane_cv.pdf",
      "created_at": "2026-07-10 00:00:00",
      "updated_at": "2026-07-10 00:05:00"
    }
  }
}
```

#### Sample Error Response (`401 Unauthenticated`)
```json
{
  "success": false,
  "message": "Authorization header missing or token invalid"
}
```

---

### `PUT /profiles/teacher`
Updates the authenticated teacher's professional profile information.
- **Method:** `PUT`
- **URL:** `https://api.staffroomng.com/api/profiles/teacher`
- **Authentication Requirement:** Yes (`Authorization: Bearer <teacherToken>`)
- **Allowed Role:** `teacher`

#### Request Body (`application/json`)
```json
{
  "bio": "Passionate educator",
  "skills": "Math, Science",
  "experience_years": 5,
  "location": "Lagos"
}
```

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Teacher profile updated successfully",
  "data": {
    "user_id": "USR-2026-000001"
  }
}
```

#### Sample Error Response (`403 Unauthorized`)
```json
{
  "success": false,
  "message": "Access denied. Teacher role required."
}
```

---

### `PUT /profiles/school`
Updates the authenticated school's institutional profile details.
- **Method:** `PUT`
- **URL:** `https://api.staffroomng.com/api/profiles/school`
- **Authentication Requirement:** Yes (`Authorization: Bearer <schoolToken>`)
- **Allowed Role:** `school`

#### Request Body (`application/json`)
```json
{
  "school_name": "Bright Future Academy",
  "address": "123 School Road",
  "lga": "Ikeja",
  "state": "Lagos",
  "website": "https://myschool.com"
}
```

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "School profile updated successfully",
  "data": {
    "user_id": "USR-2026-000002"
  }
}
```

#### Sample Error Response (`400 Validation Error`)
```json
{
  "success": false,
  "message": "school_name and address are required"
}
```

---

### `POST /profiles/upload-cv`
Uploads a curriculum vitae (`cv`) for the authenticated teacher. Validates file size (max 5MB) and type (`pdf`, `doc`, `docx`).
- **Method:** `POST`
- **URL:** `https://api.staffroomng.com/api/profiles/upload-cv`
- **Authentication Requirement:** Yes (`Authorization: Bearer <teacherToken>`)
- **Allowed Role:** `teacher`
- **Content-Type:** `multipart/form-data`
- **Form Field Name:** `cv` (file)

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "CV uploaded successfully",
  "data": {
    "cv_url": "https://api.staffroomng.com/uploads/cvs/jane_cv_64f8a.pdf"
  }
}
```

#### Sample Error Response (`400 Validation Error`)
```json
{
  "success": false,
  "message": "Invalid file type. Only PDF, DOC, and DOCX files are allowed."
}
```

---

### `POST /profiles/upload-logo`
Uploads an official institutional crest or logo (`logo`) for the authenticated school. Validates file size (max 2MB) and type (`jpg`, `jpeg`, `png`, `webp`).
- **Method:** `POST`
- **URL:** `https://api.staffroomng.com/api/profiles/upload-logo`
- **Authentication Requirement:** Yes (`Authorization: Bearer <schoolToken>`)
- **Allowed Role:** `school`
- **Content-Type:** `multipart/form-data`
- **Form Field Name:** `logo` (file)

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Logo uploaded successfully",
  "data": {
    "logo_url": "https://api.staffroomng.com/uploads/logos/school_logo_64f8b.png"
  }
}
```

#### Sample Error Response (`400 Validation Error`)
```json
{
  "success": false,
  "message": "File upload exceeded maximum permitted size of 2MB."
}
```

---

## 9. Features Endpoints

### `POST /features/saved-jobs/{job_id}`
Bookmarks a job vacancy (`job_id`) for later review by the authenticated user. Prevents duplicate saves (`409 Conflict`).
- **Method:** `POST`
- **URL:** `https://api.staffroomng.com/api/features/saved-jobs/1`
- **Authentication Requirement:** Yes (`Authorization: Bearer <token>`)
- **Allowed Role:** Any (`teacher`, `school`, or `admin`)

#### Sample Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Job saved successfully",
  "data": {
    "saved_job_id": "SAV-2026-001",
    "user_id": "USR-2026-000001",
    "job_id": "JOB-2026-001"
  }
}
```

#### Sample Error Response (`409 Conflict`)
```json
{
  "success": false,
  "message": "You have already saved this job."
}
```

---

### `GET /features/saved-jobs`
Retrieves all bookmarked job vacancies for the authenticated user.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/api/features/saved-jobs`
- **Authentication Requirement:** Yes (`Authorization: Bearer <token>`)
- **Allowed Role:** Any

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Saved jobs retrieved successfully",
  "data": {
    "saved_jobs": [
      {
        "saved_job_id": "SAV-2026-001",
        "job_id": "JOB-2026-001",
        "title": "Math Teacher",
        "school_name": "Bright Future Academy",
        "location": "Lagos",
        "salary_range": "100k-150k",
        "saved_at": "2026-07-10 00:20:00"
      }
    ]
  }
}
```

#### Sample Error Response (`401 Unauthenticated`)
```json
{
  "success": false,
  "message": "Unauthenticated"
}
```

---

### `DELETE /features/saved-jobs/{job_id}`
Removes a bookmarked job (`job_id`) from the user's saved jobs list.
- **Method:** `DELETE`
- **URL:** `https://api.staffroomng.com/api/features/saved-jobs/1`
- **Authentication Requirement:** Yes (`Authorization: Bearer <token>`)
- **Allowed Role:** Any

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Job removed from saved list",
  "data": []
}
```

#### Sample Error Response (`404 Not Found`)
```json
{
  "success": false,
  "message": "Saved job entry not found."
}
```

---

### `GET /features/notifications`
Retrieves all system alerts and recruitment notifications for the authenticated user.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/api/features/notifications`
- **Authentication Requirement:** Yes (`Authorization: Bearer <token>`)
- **Allowed Role:** Any

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "notification_id": "NOTIF-2026-001",
        "user_id": "USR-2026-000001",
        "title": "Application Shortlisted",
        "message": "Your application for Math Teacher at Bright Future Academy has been shortlisted.",
        "type": "application_status",
        "is_read": 0,
        "created_at": "2026-07-10 00:22:00"
      }
    ],
    "unread_count": 1
  }
}
```

#### Sample Error Response (`500 Server Error`)
```json
{
  "success": false,
  "message": "Could not fetch notifications"
}
```

---

### `PATCH /features/notifications/{notification_id}/read`
Marks a specific notification item (`notification_id`) as read.
- **Method:** `PATCH`
- **URL:** `https://api.staffroomng.com/api/features/notifications/1/read`
- **Authentication Requirement:** Yes (`Authorization: Bearer <token>`)
- **Allowed Role:** Any

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notification_id": "NOTIF-2026-001",
    "is_read": 1
  }
}
```

#### Sample Error Response (`404 Not Found`)
```json
{
  "success": false,
  "message": "Notification not found."
}
```

---

## 10. Admin Endpoints

### `GET /admin/stats`
Retrieves comprehensive marketplace statistics across users, profiles, jobs, and applications.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/api/admin/stats`
- **Authentication Requirement:** Yes (`Authorization: Bearer <adminToken>`)
- **Allowed Role:** `admin`

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total_users": 150,
    "total_teachers": 120,
    "total_schools": 28,
    "total_admins": 2,
    "total_jobs": 45,
    "active_jobs": 38,
    "total_applications": 310,
    "pending_verifications": 4
  }
}
```

#### Sample Error Response (`403 Unauthorized`)
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

---

### `GET /admin/verifications`
Retrieves all pending and processed school institutional verifications.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/api/admin/verifications`
- **Authentication Requirement:** Yes (`Authorization: Bearer <adminToken>`)
- **Allowed Role:** `admin`

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Verifications retrieved successfully",
  "data": {
    "verifications": [
      {
        "profile_id": "PROF-2026-002",
        "user_id": "USR-2026-000002",
        "school_name": "Bright Future Academy",
        "address": "123 School Road",
        "state": "Lagos",
        "website": "https://myschool.com",
        "verification_status": "pending",
        "created_at": "2026-07-10 00:00:00"
      }
    ]
  }
}
```

#### Sample Error Response (`403 Unauthorized`)
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

---

### `PATCH /admin/verifications/{school_profile_id}`
Processes a school verification review, changing institutional trust status.
- **Method:** `PATCH`
- **URL:** `https://api.staffroomng.com/api/admin/verifications/1`
- **Authentication Requirement:** Yes (`Authorization: Bearer <adminToken>`)
- **Allowed Role:** `admin`
- **Allowed Statuses:** `pending`, `verified`, `rejected`

#### Request Body (`application/json`)
```json
{
  "status": "verified"
}
```

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "School verification status updated successfully",
  "data": {
    "profile_id": "PROF-2026-002",
    "verification_status": "verified"
  }
}
```

#### Sample Error Response (`400 Validation Error`)
```json
{
  "success": false,
  "message": "Invalid verification status. Must be pending, verified, or rejected"
}
```

---

## 10A. Teacher Directory, Invitations, and Interviews

### `GET /teachers`
School-only teacher directory. Searches active teachers by `search`, `location`, `qualification`, and minimum `experience_years`.

- **Authentication Requirement:** Yes
- **Allowed Role:** `school`

### `GET /teachers/{user_id}`
Returns an active teacher profile, including qualifications, skills, experience, location, CV, and contact details.

- **Authentication Requirement:** Yes
- **Allowed Role:** `school`

### `POST /teachers/{user_id}/invite`
Sends a school invitation to a teacher. Optionally provide `job_id` to attach the invitation to one of the school’s open jobs.

```json
{
  "job_id": "<job_id>",
  "message": "We would love for you to apply for this position."
}
```

- **Authentication Requirement:** Yes
- **Allowed Role:** `school`

### Teacher Profile Sections

`PUT /profiles/teacher` accepts professional profile data including `education`, `teaching_experience`, `trcn_number`, `availability`, `available_from`, and `profile_visibility`. Visibility may be `schools`, `applying_schools`, or `nobody`; only `schools` profiles appear in the school directory.

### `DELETE /applications/{application_id}`
Withdraws an active application belonging to the authenticated teacher. Applications that are already accepted, rejected, hired, or withdrawn cannot be withdrawn again.

- **Authentication Requirement:** Yes
- **Allowed Role:** `teacher`

### `GET /applications/{application_id}/interview`
Returns interviews scheduled for an application. Only the owning school can access them.

### `POST /applications/{application_id}/interview`
Schedules a virtual or physical interview for an owned application.

```json
{
  "interview_type": "virtual",
  "interview_date": "2026-09-15",
  "interview_time": "10:30:00",
  "meeting_link": "https://meet.google.com/example",
  "instructions": "Please prepare a short teaching demonstration.",
  "candidate_message": "We look forward to meeting you.",
  "template_name": "Mathematics Interview Invitation"
}
```

Use `venue` instead of `meeting_link` for a `physical` interview. Scheduling updates the application to `interviewing` and notifies the teacher.

---

## 10B. Account and Settings Endpoints

### `GET|PUT|PATCH /account/profile`
Reads or updates the authenticated user’s first name, last name, full name, and phone number.

### `POST /account/password`
Changes the authenticated user’s password. Requires `current_password`, `new_password`, and `confirm_password`. New passwords must contain at least eight characters, one letter, and one number.

### `GET|PUT|PATCH /account/preferences`
Reads or saves notification preferences as a JSON object. Security notifications remain mandatory at the product level.

### `POST /account/email` and `PATCH /account/email`

---

## 10C. Recruitment Integration Additions

All endpoints below use the `/api` prefix (the existing non-prefixed aliases remain available). Protected endpoints require `Authorization: Bearer <token>`.

### Teacher profile and setup

`GET /profiles/me` returns the authenticated account and role profile. For teachers, `data.profile.setup_completed` is the authoritative setup flag and `data.profile.subjects` is a de-duplicated array. `PUT /profiles/teacher` accepts `subjects` as an array and persists the complete subject list. It also accepts `setup_completed` and validates `experience_years`, `trcn_status`, `availability`, and `profile_visibility`.

### Applications

- `GET /applications/{application_id}` returns an application only to its teacher, owning school, or an administrator.
- `GET /applications/my-applications?page=1&per_page=10` returns the teacher's applications and `pagination` metadata.
- `GET /applications/job/{job_id}?page=1&per_page=10` returns applications for a job only when the authenticated school owns that job.
- `PATCH /applications/{application_id}/status` accepts `status`. When `status` is `rejected`, `message` (or `rejection_message`) is required and is returned to the teacher. Repeating the current status returns `409`.

Application list responses expose `application_id`, `job_id`, `teacher_id`, `status`, `rejection_message`, timestamps, and relevant job/teacher fields.

### Search and pagination

`GET /jobs` supports composable `subject`, `level`/`teaching_level`, `location`, `experience`, `state`, `page`, and `per_page` filters. `GET /teachers` supports `search`, `subject`, `location`, `experience_min`, `experience_max`, `trcn_status`, `qualification`, `page`, and `per_page`. Both return a list plus `pagination` with `current_page`, `per_page`, `total`, `last_page`, and `has_more`.

`GET /jobs?recommended=1&page=1&per_page=10` is teacher-only and returns open jobs ranked deterministically by subject and location matches, including `relevance_score`.

Teacher levels `Pre KG` and `KG` are accepted as job/profile values without removing existing levels.

### Saved teachers and alerts

- `GET /features/saved-teachers` lists saved teachers for the authenticated school.
- `POST /features/saved-teachers/{teacher_user_id}` saves a teacher; duplicate saves are idempotent.
- `DELETE /features/saved-teachers/{teacher_user_id}` removes a saved teacher.
- `GET /features/job-alerts` returns the authenticated teacher's preferences.
- `PUT|PATCH /features/job-alerts` accepts `{ "subjects": ["Mathematics"], "teaching_level": "KG", "location": "Benin City", "enabled": true }`.

### Notifications

`GET /features/notifications?page=1&per_page=10` returns notifications, pagination, and `unread_count`. `PATCH /features/notifications/{notification_id}/read` marks only the owner's notification as read. `DELETE /features/notifications/{notification_id}` deletes only the owner's notification. Notification records may include `related_id` and `related_type`.

### Database migration

Run `database/migrations/2026_09_03_staffroom_backend.sql` after reviewing duplicate data. It adds normalized `teacher_subjects`, `saved_teachers`, and `job_alert_preferences` tables, setup/rejection/notification metadata, uniqueness constraints, and query indexes.
Starts and completes a verified email change. `POST` accepts `{ "email": "new@example.com" }`; `PATCH` accepts `{ "code": "123456" }`. The code is valid for ten minutes.

All account and settings endpoints require a valid JWT.

---

## 10C. Dashboard

### `GET /dashboard`
Returns role-specific home-screen metrics. Schools receive active jobs, draft jobs, total applicants, shortlisted candidates, and scheduled interviews. Teachers receive applications, shortlisted applications, and saved jobs.

- **Authentication Requirement:** Yes
- **Allowed Role:** Any authenticated user

---

## 11. Health Endpoint

### `GET /health`
Authenticated liveness and health verification check for authorized clients and monitoring systems.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/health`
- **Authentication Requirement:** Yes (`Authorization: Bearer <token>`)
- **Allowed Role:** Any authenticated user

#### Sample Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "StaffRoom API is running"
}
```

#### Sample Error Response (`500 Server Error`)
```json
{
  "success": false,
  "message": "Database connection failed"
}
```
