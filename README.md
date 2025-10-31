# Solopreneur

**A security-first, full-stack client and project management platform for solo entrepreneurs—designed with senior-level architectural principles and zero tolerance for duct tape code.**

[![CI/CD Status](https://img.shields.io/github/actions/workflow/status/melihilker/solopreneur/backend-ci.yml?branch=main&label=CI%2FCD&logo=github)](https://github.com/melihilker/solopreneur/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

---

## 🎯 Project Philosophy

This is **not** a SaaS boilerplate. This is **not** a tutorial project.

Solopreneur is an architectural blueprint built on the principle of **"Bulletproof over Convenient."** Every decision—from stateful sessions to locked-down databases—is engineered for security, scalability, and maintainability. If it smells like duct tape, it doesn't belong here.

**Built for senior developers who refuse to compromise on architecture.**

---

## 🖼️ Live Demo & Screenshots

🚧 **Coming Soon** — Production deployment in progress

---

## 🏗️ Architecture at a Glance

This is where Solopreneur differentiates itself from every "quick and dirty" project you've seen.

### 🔐 Stateful (Redis) Sessions — Not Stateless JWT

**We explicitly reject stateless JWT in favor of server-controlled sessions.**

- **Full revocability**: `destroyAllUserSessions` works instantly across all devices
- **Real-time control**: Invalidate compromised sessions without waiting for token expiry
- **Zero XSS token theft**: No tokens in localStorage or client-side JavaScript
- **Complete audit trail**: Track every active session with geolocation and device fingerprinting

Sessions are stored in Redis as JSON-serialized objects with atomic operations. This is how production systems handle authentication.

### 🛡️ "Locked Vault" Database — RLS Default Deny

**The frontend has ZERO direct database access.**

Every table in Postgres (Supabase) has Row Level Security (RLS) enabled with `DEFAULT DENY`:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- No RLS policies defined = frontend cannot query
```

The backend uses the `service_role` key to bypass RLS. This means:

- **Single source of truth**: All business logic lives in the Service layer
- **No client-side vulnerabilities**: Frontend can't be manipulated into malicious queries
- **Complete validation**: Every database interaction goes through Zod schemas and service-layer authorization

The database is a locked vault. Only the backend holds the key.

### 🏭 Factory-Based Rate Limiting — No "One Size Fits All"

**Every route gets purpose-specific, atomic rate limits.**

The `createRateLimitMiddleware` factory allows per-route configuration:

```typescript
// Login endpoint: 5 attempts per 15 minutes
router.post('/login', createRateLimitMiddleware({ 
  windowMs: 900000, max: 5, type: 'strict' 
}), authController.login);

// Public API: 100 requests per minute
router.get('/public', createRateLimitMiddleware({ 
  windowMs: 60000, max: 100, type: 'loose' 
}), controller.getPublic);
```

Rate limits are tracked in Redis with atomic `INCR` operations. No race conditions. No "good enough" blanket limits.

### 🧩 Modular Monolith — Clear Separation of Concerns

**Architecture follows the Controller (dumb) → Service (brain) → Repository (limbs) pattern.**

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts    # HTTP layer (validation, response)
│   │   ├── auth.service.ts       # Business logic (the brain)
│   │   └── auth.repository.ts    # Database operations (the limbs)
│   └── user/
│       ├── user.controller.ts
│       ├── user.service.ts
│       └── user.repository.ts
```

- **Controllers**: Dumb. Parse requests, call services, return responses.
- **Services**: Smart. Business logic, authorization, orchestration.
- **Repositories**: Specialized. Database queries, nothing else.

This isn't "clean architecture for the sake of it." It's how you maintain a codebase for years without turning it into spaghetti.

### 🛡️ Security-First Services

**Every security decision is deliberate.**

- **Timing attack prevention**: `timingSafeEqual` for all password comparisons
- **Honeypot bot detection**: Hidden form fields catch automated submissions
- **Multi-layer brute-force protection**:
  - IP-based rate limiting
  - Device fingerprint tracking
  - Email-specific attempt limits
- **Structured logging**: Pino child loggers with context (userId, IP, deviceId) for forensics

Security isn't a feature. It's the foundation.

### 🐳 Hybrid Cloud-Native Development Environment

**One command for local development, cloud services for data.**

```bash
docker-compose up --build
```

This starts:
- **Backend** (Express API) → `localhost:3001`
- **Frontend** (Next.js 15) → `localhost:3000`

**Database and Cache are cloud-native:**
- **Database**: Supabase (PostgreSQL) — Managed, production-grade Postgres with RLS
- **Cache**: Upstash (Redis) — Serverless Redis for sessions and rate limiting

This hybrid architecture means:
- **No local database setup**: Connect directly to Supabase (same credentials for dev and prod)
- **No Redis container**: Upstash handles sessions with global replication
- **Production parity**: Your local backend connects to the same infrastructure as production
- **Zero "works on my machine" database issues**: Everyone uses the same cloud database

No "works on my machine" problems. No manual service setup. The application code is containerized, but data services are bulletproof cloud infrastructure.

### ⚙️ CI/CD Ready

**GitHub Actions pipelines for continuous integration.**

- `backend-ci.yml`: Linting → Testing → Build verification on every PR
- `frontend-ci.yml`: Next.js build checks and TypeScript validation
- **Deployment ready**: Docker images push to registry, SSH to production server, zero-downtime deployment

Production-grade automation from day one.

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript 5.3
- **Framework**: Express.js with async/await error handling
- **Authentication**: Argon2 (password hashing) + Redis (session store)
- **Validation**: Zod schemas for all inputs
- **Logging**: Pino with structured child loggers
- **Database**: Supabase (PostgreSQL) with `service_role` bypass
- **Cache**: Upstash (Redis) for sessions and rate limiting
- **Environment**: Docker Compose for application services

### Frontend
- **Framework**: Next.js 15 (App Router) with Turbopack
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 with shadcn/ui components (CVA, clsx, tailwind-merge)
- **HTTP Client**: Custom `apiClient` fetch wrapper with credentials
- **Middleware**: Cookie forwarding for session management

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (linting, testing, building)
- **Deployment**: (Planned) Docker image push + SSH deployment

---

## 🚀 Getting Started

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js 18+** (optional, for local TypeScript checking)
- **Git**
- **Supabase account** (free tier available at [supabase.com](https://supabase.com))
- **Upstash account** (free tier available at [upstash.com](https://upstash.com))

### 1. Clone the Repository

```bash
git clone https://github.com/melihilker/Solopreneur.git
cd solopreneur
```

### 2. Set Up Cloud Services

**Supabase (Database):**
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** to get your credentials
3. Copy your **Project URL** and **service_role key** (not anon key!)

**Upstash (Redis):**
1. Create a new Redis database at [upstash.com](https://upstash.com)
2. Go to your database dashboard
3. Copy your **REST URL** and **REST Token**

### 3. Configure Environment Variables

Create `.env` files in the appropriate directories:

**Backend (`/backend/.env`):**
```env
# Node Environment
NODE_ENV=development

# Server Configuration
PORT=3000
COOKIE_DOMAIN=localhost

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Frontend (`/frontend/.env.local`):**
```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3001/
```

> **Critical**: Use your **real** Supabase and Upstash credentials. The backend container connects directly to these cloud services.

### 4. Start the Stack

```bash
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

Hot reload is enabled for both frontend and backend. Changes are reflected instantly.

### 5. Verify the Setup

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Test backend health
curl http://localhost:3001/health
```

You're ready to develop.

---

## 🤝 Contributing

We welcome contributions from developers who share our "bulletproof over convenient" philosophy.

**Before contributing, please read:**

📖 **[CONTRIBUTING.md](CONTRIBUTING.md)** — Understand our architectural principles, zero duct tape tolerance, and Git workflow.

**Quick summary:**
- No stateless JWT proposals (we're stateful by design)
- No direct database access from frontend (locked vault principle)
- No "one size fits all" solutions (everything is purpose-built)
- Code must pass self-review before PR submission

If you're looking for a quick tutorial project to pad your GitHub, this isn't it. If you want to contribute to production-grade architecture, welcome aboard.

---

## 🗺️ Roadmap

Want to see where this project is headed?

📋 **[ROADMAP.md](ROADMAP.md)** — Explore the post-MVP vision including CI/CD pipelines, 2FA, audit logging, payment integration, and more.

**Upcoming priorities:**
- Projects module with time tracking
- Customers module with relationship management
- Email verification and password reset flows
- Advanced admin dashboard
- E2E testing with Playwright/Cypress

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 👨‍💻 Developer

**Melih Ilker (Melly)**  
Full-Stack Engineer

- GitHub: [@MelihIlker](https://github.com/MelihIlker)
- Email: [melihilker9@gmail.com](mailto:melihilker9@gmail.com)
- LinkedIn: [melihilker](https://www.linkedin.com/in/melihilker)
- Stack Overflow: [mely](https://stackoverflow.com/users/31781322/mely)

---

## 🙏 Acknowledgments

Built with the understanding that **convenience is temporary, but architecture is forever.**

---

**Questions? Found a security vulnerability?**  
Open an issue or contact: [melihilker9@gmail.com](mailto:melihilker9@gmail.com)

---

*"We build less, but we build it bulletproof."*
