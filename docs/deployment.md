# Deployment Notes

## Runtime Services

- MongoDB for primary data
- Redis for queues, cache, and revocation-aware sessions
- Backend Express API behind a reverse proxy
- Frontend static bundle served by Nginx or CDN

## Production Checklist

- Replace all secrets from `.env.example`
- Enable `COOKIE_SECURE=true`
- Set strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- Configure managed MongoDB and Redis with backups
- Add TLS termination and trusted proxy configuration
- Ship logs to a central sink such as Datadog, ELK, or OpenSearch
- Run BullMQ workers as separate scalable processes
- Use horizontal autoscaling for API pods and queue workers

## CI/CD Expectations

- Install dependencies
- Lint and typecheck backend and web workspaces
- Build Docker images
- Promote environment-specific manifests or compose overlays