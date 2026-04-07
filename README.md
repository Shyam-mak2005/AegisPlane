# AegisPlane

AegisPlane is a production-style multi-tenant control plane built as a monorepo with:

- `apps/backend`: Node.js, Express, TypeScript, MongoDB, Redis, BullMQ
- `apps/web`: React, TypeScript, Vite, TailwindCSS, Zustand, TanStack Query

## Quick Start

1. Copy `.env.example` to `.env` and update secrets.
2. Install dependencies with `npm install`.
3. For local `node ...` runs, keep `MONGO_URI` and `REDIS_URL` pointed at `localhost`.
4. For Docker Compose, the stack uses `.env.docker` automatically.
5. Run `docker compose up --build` for the full stack or use workspace scripts locally.

## Workspaces

- Backend API: `http://localhost:4000/api/v1`
- Frontend UI: `http://localhost:5173`

## Core Capabilities

- Multi-tenant isolation with tenant-aware repositories and middleware
- Access/refresh token auth with revocation-aware sessions
- Role-based and permission-based authorization
- Feature flags, plan controls, rate controls, and auditability
- BullMQ queues for async work
- Docker-ready local deployment assets
