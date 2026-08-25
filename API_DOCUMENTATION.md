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
- **Stateless JWT Authentication**: Authenticated sessions rely on JSON Web Tokens (`JWT`) signed securely with `HMAC-SHA256` and expire after 24 hours (`JWT_EXPIRES_IN=1d`).

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
Retrieves a paginated list of active job vacancies. Supports optional query filters by `subject` and `state`.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/api/jobs?subject=Mathematics&state=Lagos`
- **Authentication Requirement:** No (Public)
- **Allowed Role:** Any

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
        "status": "active",
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
Retrieves full details for a single job vacancy identified by `job_id`.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/api/jobs/1`
- **Authentication Requirement:** No (Public)
- **Allowed Role:** Any

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
  "requirements": "BSc Mathematics"
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
  "message": "You have already applied for this job"
}
```

---

### `GET /applications/my-applications`
Retrieves applications submitted by the authenticated teacher, optionally filtered by the status tabs used in the teacher dashboard. Each application includes a chronological status timeline.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/api/applications/my-applications`
- **Authentication Requirement:** Yes (`Authorization: Bearer <teacherToken>`)
- **Allowed Role:** `teacher`
- **Optional Query Parameter:** `status` = `submitted`, `reviewed`, `shortlisted`, `rejected`, or `accepted`

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
        "status_timeline": [
          { "status": "submitted", "created_at": "2026-07-10 00:15:00" },
          { "status": "shortlisted", "created_at": "2026-07-11 10:00:00" }
        ],
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

### Teacher Application Workflow
The teacher application review screen displays the job title, school, location, employment type, the current CV, and the selected cover letter. The teacher may replace the CV through `POST /profiles/upload-cv`, then submit the cover letter through `POST /applications/apply/{job_id}`. A successful submission returns the application with status `submitted`; subsequent school status changes appear in `status_timeline` and generate a notification.

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
- **Allowed Statuses:** `submitted`, `reviewed`, `shortlisted`, `rejected`, `accepted`

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
  "location": "Lagos",
  "trcn_number": "TRCN/NP/123456",
  "availability": "available",
  "preferred_employment_type": "full-time",
  "preferred_location": "Lagos",
  "available_from": "2026-09-01"
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

### `POST /profiles/upload-trcn-certificate`
Uploads or replaces the authenticated teacher's TRCN certificate.
- **Authentication:** Bearer token required; role `teacher`
- **Content-Type:** `multipart/form-data`
- **Form Field:** `certificate`
- **Allowed Types:** PDF, JPG, JPEG, PNG; maximum 5MB
- **Success:** Returns `certificate_url` and the updated teacher profile.

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
  "message": "Notifications fetched successfully",
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

## 11. Health Endpoint

### `GET /health`
Public liveness and health verification check for load balancers and monitoring systems.
- **Method:** `GET`
- **URL:** `https://api.staffroomng.com/health`
- **Authentication Requirement:** No (Public)
- **Allowed Role:** Any

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
