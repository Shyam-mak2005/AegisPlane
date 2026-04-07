# AegisPlane Architecture

## Backend Folder Structure

```text
apps/backend/src
  config/
  controllers/
  jobs/
  middleware/
  models/
  repositories/
  routes/
  services/
  shared/
  types/
  validators/
  app.ts
  server.ts
```

## Schema Design

- `Tenant`: tenant identity, lifecycle status, plan, feature overrides, counters, metadata.
- `User`: tenant-bound identity, password hash, account status, platform-admin flag, role references, last login.
- `Role`: tenant or platform scope, granular permission keys, system-role guard.
- `Permission`: canonical permission catalog for RBAC composition.
- `FeatureFlag`: global defaults, plan entitlements, rollout percentages, tenant overrides.
- `Subscription`: commercial plan state, limits, usage snapshot, billing cycle window.
- `AuditLog`: structured actor and target trail with metadata, severity, IP, and user-agent.
- `RefreshToken`: revocation-aware session storage with token family rotation support.

## Authentication Flow

1. `POST /api/v1/auth/login` validates credentials against a tenant-aware user record.
2. Passwords are verified with bcrypt, then an access token and refresh token are issued.
3. Refresh tokens are stored hashed in MongoDB and set as secure HTTP-only cookies.
4. `POST /api/v1/auth/refresh` rotates the refresh token and preserves the session family.
5. `POST /api/v1/auth/logout` revokes the session family to invalidate active refresh tokens.

## Middleware Design

- `requestContext`: assigns request IDs for correlation.
- `authenticate`: verifies JWT access tokens and hydrates auth context.
- `tenantContext`: resolves and enforces tenant scope from auth or explicit headers.
- `authorize(...)`: checks permission keys and respects platform-admin override.
- `validate(...)`: applies Zod request validation.
- `errorHandler`: centralized structured error responses.
- `rate-limit`: separate auth and API limits.

## API Route Plan

- `GET /health`, `GET /readiness`
- `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- `GET /dashboard`
- `GET/POST /tenants`, `GET /tenants/:id`, `POST /tenants/:id/suspend`, `PATCH /tenants/:id/plan`
- `GET/POST /users`, `GET /users/:id`, `PATCH /users/:id/roles`, `POST /users/:id/disable`, `POST /users/:id/reset-password`
- `GET/POST/PATCH /roles`
- `GET/PATCH /features`
- `GET /subscriptions/plans`, `GET /subscriptions/tenant/:tenantId`
- `GET /audit-logs`

## Deployment Setup

- Root `.env.example` for local and production variable shape.
- Dockerfiles for backend and web workspaces.
- `docker-compose.yml` for MongoDB, Redis, API, and frontend runtime.
- `docs/deployment.md` with production readiness checklist.

## Architectural Decisions

- Repository and service layers keep tenant scoping and business logic out of controllers.
- Refresh tokens are hashed and revocable to support secure session invalidation.
- Audit events are enqueued through BullMQ so write-heavy operational paths stay responsive.
- Plan definitions are centralized and reused by subscription orchestration.
- The UI uses cached query hooks with mock-safe fallbacks to stay usable before live API wiring is complete.

## Scaling Later

- Move workers into separate deployable processes instead of loading them in the API runtime.
- Add Redis-backed distributed rate limiting keyed by tenant and plan tier.
- Introduce per-tenant sharding or partitioned collections for high-audit tenants.
- Replace mock web fallbacks with authenticated real API integration and optimistic mutations.
- Add OpenTelemetry tracing and metrics export for request, queue, and database spans.