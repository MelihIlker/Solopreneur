# Contributing to Solopreneur

Welcome to Solopreneur. This is a production-grade project where every architectural decision is documented and intentional.

## Core Architectural Philosophy

Before contributing, it's important to understand the design principles behind this project.

### Session-Based Authentication

Solopreneur uses stateful Redis sessions instead of JWT tokens.

Benefits:
- **Full revocability**: Sessions can be invalidated instantly across all devices
- **Real-time control**: Compromised sessions can be revoked server-side immediately
- **Audit trail**: Complete session tracking for security monitoring
- **Simplified refresh**: No token expiration or refresh token complexity

### Database Security with Row Level Security

The frontend has no direct database access.

Every table in Postgres (Supabase) has Row Level Security enabled with a default-deny policy:

```sql
ALTER TABLE [every_table] ENABLE ROW LEVEL SECURITY;
-- No policies = frontend cannot query
```

The backend uses the `service_role` key to bypass RLS. This ensures:
- All business logic validation happens server-side
- Frontend cannot be exploited to access unauthorized data
- Complete data isolation at the database level

### Rate Limiting Strategy

Rate limits are configured per-endpoint to match specific threat models:

```typescript
createRateLimitMiddleware({ WINDOW_MS: 900000, MAX_REQUESTS: 5, KEY_PREFIX: 'login' })  // Login
createRateLimitMiddleware({ WINDOW_MS: 60000, MAX_REQUESTS: 100, KEY_PREFIX: 'profile' })  // Public API
```

This approach:
- Eliminates code duplication
- Allows endpoint-specific protection
- Prevents configuration drift across routes

### CSRF Protection

CSRF tokens are stored server-side in Redis, tied to user sessions.

Solopreneur's approach:
- **Session-tied tokens**: Each CSRF token is tied to the user's `access_token` (session ID)
- **Redis storage**: Tokens live server-side with 30-minute TTL
- **Header-based transmission**: Tokens sent via `X-CSRF-Token` header (not cookies)
- **Constant-time comparison**: Token validation uses `timingSafeEqual` to prevent timing attacks
- **Per-request refresh**: Token regenerates after each successful POST/PUT/DELETE/PATCH request
- **Per-tab isolation**: Different browser tabs have different session IDs (derived from `access_token`)

This provides strong protection against Cross-Site Request Forgery attacks without cookie vulnerabilities.

## Git Workflow

### Branch Strategy

The `main` branch represents production-ready code.

Follow this workflow:

1. **Create task-specific branches from `main`:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/add-project-archiving
   # or
   git checkout -b fix/session-serialization-bug
   ```

2. **Write your code** following the existing architectural patterns

3. **Self-review before opening PR:**
   - Does this follow the Controller → Service → Repository pattern?
   - Are all inputs validated with Zod schemas?
   - Does this introduce any timing attack vulnerabilities?
   - Is rate limiting appropriate for this endpoint?
   - Are errors logged with proper context (child loggers)?

4. **Open Pull Request to `main`:**
   - Title format: `feat: add project archiving` or `fix: session serialization in Redis`
   - Description must explain the "why" not just the "what"
   - Link to any related issues

5. **Merge after approval** (or self-merge if you're a maintainer and confident)

### Commit Messages

Follow conventional commits:
```
feat: add email verification flow with Redis TTL tokens
fix: prevent timing attack in password comparison
refactor: extract rate limit factory to shared middleware
docs: clarify session storage architecture in README
```

## Local Setup (Docker)

This project uses Docker Compose to orchestrate the entire stack. One command spins up everything.

### Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (for local TypeScript checking, optional)

### Environment Configuration

Create `.env` files in the appropriate directories:

**Backend (`/backend/.env`):**
```env
NODE_ENV=development
PORT=3001

# Database (Supabase with service_role key)
DATABASE_URL=postgresql://solouser:solopass@db:5432/solodb
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Redis (session store)
REDIS_URL=redis://cache:6379

# Security
SESSION_SECRET=your_secure_random_string_here
CORS_ORIGIN=http://localhost:3000

# Rate Limiting (optional overrides)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

**Frontend (`/frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Start the Stack

```bash
# From project root
docker-compose up --build
```

This starts:
- **Backend** (Express API) → `localhost:3001`
- **Frontend** (Next.js 15) → `localhost:3000`
- **Database** (PostgreSQL) → `localhost:5432`
- **Cache** (Redis) → `localhost:6379`

Visit `http://localhost:3000` and the entire system is live.

### Development Workflow

- Backend code is in `/backend/src`
- Frontend code is in `/frontend`
- Hot reload is enabled for both
- Logs stream to console with Pino structured logging

To rebuild after dependency changes:
```bash
docker-compose down
docker-compose up --build
```

## Developer Notes & Troubleshooting

### CORS & Credentials

The backend's `CORS_ORIGIN` **must** match the frontend's origin exactly. The frontend's `apiClient` includes:

```typescript
credentials: 'include'
```

This is **critical**. Without it, cookies (including `access_token` session ID) won't be sent cross-origin. If you see authentication failures, check this first.

### Next.js Middleware Cookie Forwarding

The frontend's `middleware.ts` **manually** forwards the `access_token` cookie to the backend:

```typescript
Cookie: access_token=${accessToken}
```

Why manual? Next.js middleware doesn't automatically forward cookies in `fetch` calls. This is not a bug—it's by design. The middleware acts as a proxy, so we explicitly reconstruct the `Cookie` header.

If authentication seems to "forget" the user on protected routes, check that the middleware is correctly extracting and forwarding the cookie.

### Session Serialization Gotcha

In `session.service.ts`, sessions are stored in Redis via `JSON.stringify`. This means:

```typescript
// BAD - Will cause serialization errors
session.user = new UserEntity(data)  // Class instance

// GOOD - Plain object
session.user = { id, email, role }  // Serializable
```

**Never store class instances or functions in session objects.** Redis can only store JSON-serializable data. If you see `[object Object]` or serialization errors, this is why.

### Rate Limiting Headers

All rate-limited routes return headers:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1678901234567
```

If a route seems to reject requests prematurely, check these headers. The `createRateLimitMiddleware` factory logs every limit hit.

### Security Testing Checklist

Before submitting code that touches authentication or authorization:

- [ ] Timing attacks prevented? (Use `timingSafeEqual` for comparisons)
- [ ] Brute-force protection in place? (IP + Device + Email tracking)
- [ ] Honeypot field checked? (Bot detection)
- [ ] Input sanitized and validated? (Zod schemas on all inputs)
- [ ] Errors don't leak sensitive info? (Generic messages to client, detailed logs server-side)

## Code Quality Standards

### TypeScript

- **Strict mode enabled:** No `any` types without justification
- **Explicit return types** on public functions
- **Zod schemas** for all external input (API requests, env vars)

### Testing

- Unit tests for services (business logic)
- Integration tests for repositories (database interactions)
- E2E tests for critical flows (auth, payments)

Run tests:
```bash
npm test
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

Code that doesn't pass linting won't merge.

## Pull Request Guidelines

A good PR:
- **Solves one problem** (no "kitchen sink" PRs)
- **Includes tests** for new functionality
- **Updates documentation** if behavior changes
- **Has meaningful commit messages** (see Git Workflow)
- **Passes CI checks** (linting, tests, build)

A bad PR:
- "Fixed stuff"
- 50 files changed across unrelated modules
- No tests
- Breaks existing functionality

Review your own PR before requesting review from others. Pretend you're seeing this code for the first time. Would you approve it?

## Questions & Communication

- **Bugs:** Open an issue with reproduction steps
- **Features:** Open an issue with use case and proposed design
- **Security:** Email security@solopreneur.dev (do not open public issues)

---

Thank you for contributing to Solopreneur.