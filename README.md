# Solopreneur

A full-stack client and project management platform designed for solo entrepreneurs. Built with modern web technologies, security best practices, and real-time capabilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Express](https://img.shields.io/badge/Express-5.1-black?logo=express)](https://expressjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)

---

## 📋 Overview

Solopreneur is a complete solution for managing clients, projects, invoices, and time tracking. The application emphasizes security, scalability, and clean architecture.

**Key Features:**
- Client and project management
- Time tracking and billing
- Invoice generation
- Secure authentication with session-based login
- Real-time dashboard with analytics
- Mobile-responsive design

---

## 🏗️ Architecture

### Backend Architecture

The backend follows a layered architecture pattern:

- **Controller Layer**: Handles HTTP requests and responses
- **Service Layer**: Contains business logic and validation
- **Repository Layer**: Manages database operations

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
│   │   ├── controller/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── routes/
│   ├── project/
│   ├── customer/
│   ├── payment/
│   └── user/
├── shared/
│   ├── middleware/
│   └── types/
└── config/
```

### Authentication & Security

- **Session Management**: Redis-based stateful sessions with full revocation control
- **Password Hashing**: Argon2 for secure password storage
- **Rate Limiting**: Per-endpoint rate limit configuration to prevent abuse
- **Input Validation**: Zod schemas for all API inputs
- **Database Security**: Row Level Security (RLS) enabled on all tables

### Frontend Architecture

- **Next.js 15** with App Router
- **React 19** for component structure
- **Tailwind CSS 4** for styling
- **Chart.js** for data visualization
- **Responsive Design** for all devices

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript 5.9
- **Framework**: Express.js 5.1 with Helmet security headers
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Cache & Session Store**: Upstash Redis
- **Password Hashing**: Argon2
- **Validation**: Zod schemas
- **Logging**: Pino with structured logging
- **Rate Limiting**: Redis-backed per-endpoint configuration

### Frontend
- **Framework**: Next.js 15 (App Router) with Turbopack
- **Runtime**: React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Class Variance Authority (CVA), Clsx, Tailwind Merge
- **Animations**: Motion library
- **Charts**: Chart.js 4 with React wrapper
- **Icons**: Lucide React
- **Responsive Design**: Mobile-first with full responsiveness

### DevOps & Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for local development
- **Environment Management**: .env and .env.local for secrets
- **Development**: Live reload for both frontend and backend

---

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### 1. Clone Repository

```bash
git clone https://github.com/melihilker/Solopreneur.git
cd Solopreneur
```

### 2. Environment Configuration

Create `.env` files for backend and frontend:

**Backend (`/backend/.env`):**
```env
# Node Environment
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Frontend (`/frontend/.env.local`):**
```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3001/
```

### 3. Start Application

```bash
docker-compose up --build
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### 4. Verify Setup

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Test backend health
curl http://localhost:3001/health
```

---

## 📁 Project Structure

```
solopreneur/
├── backend/
│   ├── src/
│   │   ├── modules/          # Feature modules
│   │   ├── config/           # Configuration
│   │   ├── shared/           # Shared utilities and types
│   │   └── main.ts           # Entry point
│   ├── Dockerfile            # Docker configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── package.json          # Dependencies
│
├── frontend/
│   ├── app/                  # Next.js App Router
│   ├── components/           # Reusable components
│   ├── public/               # Static assets
│   ├── Dockerfile            # Docker configuration
│   ├── tailwind.config.ts    # Tailwind configuration
│   └── package.json          # Dependencies
│
├── docker-compose.yml        # Service orchestration
└── README.md                 # This file
```

---

## 🔄 Development Workflow

### Local Development

```bash
# Start all services
docker-compose up

# View logs from specific service
docker-compose logs -f frontend
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild after dependency changes
docker-compose up --build
```

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📊 Database Architecture

### Supabase PostgreSQL with Row Level Security

- **Backend-Only Access**: Frontend has no direct database access
- **All queries** go through backend API endpoints
- **Row Level Security (RLS)**: Enabled on all tables with default-deny policy
- **Service Role Key**: Only backend uses service role for administrative operations
- **Type Safety**: Database types can be generated from Supabase for TypeScript

### Core Tables

- **users**: User accounts and authentication
- **projects**: Project information and status tracking
- **customers**: Client/customer information
- **invoices**: Invoice records and payment tracking
- **sessions**: User session management (stored in Redis)

### Security Model

The database operates on a "locked vault" principle:
- Frontend cannot directly query any table
- All business logic validation happens in backend services
- User authorization checked before each operation
- Data isolation enforced at the database level

---

## 🔐 Security-First Architecture

Solopreneur is built with security as a foundational principle. Every layer implements specific security measures designed for production environments.

### Authentication & Session Management

- **Stateful Sessions**: Redis-based session store for full server control
  - Sessions stored in Upstash Redis with configurable TTL (default: 7 days)
  - Maximum 5 active sessions per user (configurable)
  - Sessions can be invalidated instantly across all devices
  - Full server-side control over session lifecycle
  - No tokens stored in client-side storage (only HTTP-only cookies)

- **Password Security**:
  - Argon2 hashing algorithm for secure password storage
  - Timing-safe comparison to prevent timing attacks
  - Sensitive password data never logged or exposed in responses

### Multi-Layer Brute-Force Protection

- **IP-Based Blocking**:
  - Tracks failed login attempts per IP address
  - Automatic IP blocking after 5 failed attempts
  - 30-minute lock duration per IP
  - Tracked in Redis for atomic operations

- **Device Fingerprinting**:
  - Tracks login attempts per device/user agent
  - Prevents automated attacks from specific devices
  - Device blocking with configurable thresholds

- **Account-Level Locking**:
  - Temporary account locks after repeated failed attempts
  - 30-minute lock-out period
  - Logged for security audit trails

### Database Security (Supabase PostgreSQL)

- **Row Level Security (RLS)**: Default-deny policy on all tables
  - Frontend cannot directly access database
  - All data access through backend API with authorization
  - Service role key used only for backend administrative operations
  - Enforces data isolation at database level

- **Input Validation**: Zod schemas for all API inputs
  - Type-safe validation at request boundaries
  - Consistent error responses without data leakage
  - XSS and SQL injection prevention

### API Security

- **Rate Limiting**: Per-endpoint configuration with Redis tracking
  - Login endpoint: 5 attempts per 15 minutes
  - General endpoints: 20 requests per minute
  - Prevents brute-force and credential stuffing
  - Separate limits for different endpoint types

- **CORS Protection**: Restricted cross-origin requests
  - Only approved origins (configured in CORS_ORIGIN)
  - Prevents unauthorized third-party access

- **HTTP Security Headers**: Helmet.js integration
  - Content Security Policy (CSP)
  - X-Frame-Options to prevent clickjacking
  - X-Content-Type-Options to prevent MIME sniffing
  - X-XSS-Protection and other standard protections

- **Cookie Security**:
  - HTTP-only cookies (cannot be accessed by JavaScript)
  - SameSite=strict to prevent CSRF attacks
  - Secure flag in production
  - 3-hour default session cookie age (configurable)

### Honeypot Bot Detection

- **Registration Form**: Hidden honeypot field catches automated submissions
  - Bots filling all fields including hidden ones trigger security response
  - IP and device automatically locked on honeypot detection
  - Legitimate users ignore invisible fields, pass through

### Infrastructure Security

- **Docker Isolation**: Services run in isolated containers
  - Non-root user privileges in containers
  - Multi-stage builds for minimal image size
  - Secrets managed through environment variables only

- **Error Handling**: Safe error responses
  - No stack traces exposed to clients
  - Generic error messages prevent information leakage
  - Detailed logs for debugging (backend only)

### Logging & Monitoring

- **Structured Logging**: Pino logger with contextual information
  - Tracks user ID, IP address, device fingerprint in logs
  - Separate log levels for development vs. production
  - Helps with security incident investigation and forensics
  - Correlation IDs for request tracing

---

## 🤝 Contributing

Contributions are welcome. Please ensure:
- Code follows TypeScript best practices
- All inputs are validated with Zod schemas
- Changes are tested before submission
- Commit messages are clear and descriptive

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 👨‍💻 Developer

**Melih Ilker**

- GitHub: [@MelihIlker](https://github.com/MelihIlker)
- Email: [melihilker9@gmail.com](mailto:melihilker9@gmail.com)

---

## � Support

For questions or issues, please open an issue on GitHub or contact the developer.

---

*"We build less, but we build it bulletproof."*
