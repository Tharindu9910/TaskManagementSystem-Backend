# PLAN.md — Task Management System

## Backend Choice: NestJS

use **NestJS** as the backend framework.

**Why?**

* Enforces a modular architecture (Modules, Controllers, Services) which improves separation of concerns and maintainability.
* TypeScript-first framework for strong typing and code quality.
* Built-in ecosystem for validation, authentication guards, interceptors, and middleware improves security and scalability.
* Supports future scaling and clean architecture discussions during the technical walkthrough.

---

## High-Level Architecture

**Architecture**

1. **Frontend (Next.js)**

   * Handles UI, form validation(React-hook forms), route protection and API communication.
   * Never accesses the database directly.

2. **Backend API (NestJS)**

   * Authentication & authorization
   * Business logic and validation
   * Secure data access layer
   * Issues secure cookies containing JWT tokens.

3. **Database (PostgreSQL)**

   * Stores Users and Tasks.
   * Each task is linked to a user via `userId`.

**Request Flow**

* User authenticates → backend validates credentials → secure HttpOnly cookie issued and maintain serverside auth session
* Authenticated requests automatically send cookie → backend verifies JWT → returns only user-owned data.
* All task operations enforce ownership checks.


## Security Strategy (High Level)

* Use HttpOnly, Secure, SameSite=None  cookies for authentication.
* Strict CORS policy to permit requests only from trusted, allow-listed origins.
* Strong password hashing using Argon2.
* Input validation and sanitization on all endpoints.
* Rate limiting on authentication routes.
* Authorization checks ensuring users access only their own tasks.
* Centralized error handling to avoid stack trace leaks.
* Environment variables managed securely with `.env.example`.

