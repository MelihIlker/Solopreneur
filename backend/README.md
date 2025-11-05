# Solopreneur Backend

Express.js-based REST API backend for Solopreneur client and project management platform. Built with TypeScript, Redis, and PostgreSQL (Supabase).

## 🏗️ Architecture

### Layered Architecture

The backend follows a clean, layered architecture:

```
Controller Layer (HTTP Handling)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database / Cache
```

**Benefits:**
- Clear separation of concerns
- Easy to test (mock each layer independently)
- Business logic isolated from HTTP concerns
- Consistent error handling

### Module Structure

Each feature module contains:

```
src/modules/auth/
├── controller/          # HTTP request handlers
├── services/            # Business logic
│   ├── auth.service.ts
│   ├── session.service.ts
│   ├── csrf.service.ts
│   └── email.service.ts
├── repositories/        # Database operations
├── validators/          # Zod validation schemas
├── routes/              # Route definitions
└── index.ts             # Module exports
```

### Key Design Decisions

**Stateful Sessions (Redis)**
- Sessions stored in Redis with full revocation capability
- User data serialized as JSON in Redis
- Session TTL: 7 days (configurable)
- Maximum 5 active sessions per user

**Database Security (Row Level Security)**
- All tables have RLS enabled with default-deny
- Frontend cannot query database directly
- Backend uses `service_role` key for administrative operations
- All business logic enforced server-side

**CSRF Protection**
- Tokens stored in Redis (not cookies)
- Session-tied tokens with 30-minute TTL
- Constant-time comparison prevents timing attacks
- Per-endpoint rate limiting

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Language | TypeScript 5.9 |
| Framework | Express.js 5.1 |
| Database | Supabase (PostgreSQL) |
| Cache/Session | Upstash Redis |
| Password Hashing | Argon2 |
| Validation | Zod |
| Logging | Pino |
| HTTP Security | Helmet.js |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Redis instance (Upstash or local)
- PostgreSQL database (Supabase or local)
- Docker (optional, for local Redis/Postgres)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Configuration

Create `.env` file:

```env
# Node Environment
NODE_ENV=development
PORT=3001

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# CORS
CORS_ORIGIN=http://localhost:3000

# Session
SESSION_SECRET=your_random_secret_key_here

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

### Running Locally

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Production start
npm start

# Run tests
npm test

# Run linting
npm run lint
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Entry point
│   │
│   ├── config/
│   │   ├── config.ts              # Config loading (env vars, constants)
│   │   ├── csrf.ts                # CSRF middleware
│   │   └── supabase/
│   │       └── client.ts          # Supabase client initialization
│   │
│   ├── modules/                   # Feature modules
│   │   ├── auth/
│   │   │   ├── controller/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── validators/
│   │   │   ├── routes/
│   │   │   └── index.ts
│   │   ├── user/
│   │   ├── project/
│   │   ├── customer/
│   │   └── payment/
│   │
│   ├── shared/
│   │   ├── middleware/            # Global middleware
│   │   │   ├── rate-limit.middleware.ts
│   │   │   ├── ip-block.middleware.ts
│   │   │   ├── email-block.middleware.ts
│   │   │   └── auth.middleware.ts
│   │   └── types/                 # Shared interfaces
│   │       ├── AuthInterface.ts
│   │       └── UserInterface.ts
│   │
│   ├── lib/
│   │   └── redis.ts               # Redis client wrapper
│   │
│   └── utils/
│       ├── logger.ts              # Pino logger setup
│       └── mapper.ts              # Database ↔ TypeScript mapping
│
├── jest.config.js                 # Jest testing config
├── tsconfig.json                  # TypeScript config
├── package.json
└── Dockerfile
```

## 🔐 Security Features

### Authentication

- **Stateful Sessions**: Redis-based with full revocation
- **Password Hashing**: Argon2 with salt
- **Timing Attack Prevention**: Constant-time comparison for tokens
- **Session Limits**: Maximum 5 concurrent sessions per user

### Multi-Layer Brute-Force Protection

- **IP-Based Blocking**: 5 failed attempts → 30-minute IP block
- **Device Fingerprinting**: User-agent based tracking
- **Account-Level Locking**: Temporary lock after repeated failures
- **Email Validation**: Honeypot field for bot detection

### API Security

- **CORS**: Restricted to configured origins
- **HTTP Security Headers**: Helmet.js integration
- **Rate Limiting**: Per-endpoint configuration
- **Input Validation**: Zod schemas on all inputs
- **CSRF Protection**: Session-tied tokens

### Database Security

- **Row Level Security (RLS)**: Default-deny on all tables
- **Service Role Key**: Only backend accesses database
- **Input Sanitization**: Parameterized queries via Supabase
- **No Direct Client Access**: All queries through API

## 🧪 Testing

### Unit Tests

```bash
npm test -- --coverage
```

Test files follow the pattern: `*.test.ts` or `*.spec.ts`

**Coverage targets:**
- Services: 80%+
- Critical auth flows: 100%
- Repositories: 70%+

### Integration Tests

```bash
npm run test:integration
```

Tests with real database (uses test container):
- Session storage in Redis
- Database transactions
- API endpoint flows

## 📊 API Endpoints

### Authentication

```
POST   /api/auth/register      - User registration
POST   /api/auth/login         - User login
POST   /api/auth/logout        - User logout
GET    /api/auth/me            - Current user info
GET    /api/csrf-token         - Get CSRF token
```

### User Management

```
GET    /api/user/profile       - Get profile
PUT    /api/user/profile       - Update profile
DELETE /api/user/profile       - Delete account
POST   /api/user/change-password   - Change password
POST   /api/user/change-email      - Change email
```

### Projects (Coming Soon)

```
GET    /api/projects           - List projects
POST   /api/projects           - Create project
GET    /api/projects/:id       - Get project
PUT    /api/projects/:id       - Update project
DELETE /api/projects/:id       - Delete project
```

## 🔍 Logging

Structured logging with Pino:

```bash
# Development: Human-readable format
npm run dev

# Production: JSON format for log aggregation
NODE_ENV=production npm start
```

Log levels:
- `info`: Request lifecycle, important events
- `warn`: Potential issues (rate limit hits, failed login attempts)
- `error`: Unexpected errors

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t solopreneur-backend .

# Run container
docker run -p 3001:3001 \
  -e SUPABASE_URL=$SUPABASE_URL \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  solopreneur-backend
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod_key_here
UPSTASH_REDIS_REST_URL=https://prod-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=prod_token_here
CORS_ORIGIN=https://solopreneur.com
```

## 📚 Development Guidelines

### Code Style

- TypeScript strict mode enabled
- Explicit return types on all functions
- No `any` types without documentation
- ESLint + Prettier for formatting

### Adding New Endpoints

1. Create validator with Zod schema
2. Create service with business logic
3. Create repository for data access
4. Create controller to handle HTTP
5. Define route with middleware
6. Add tests

Example:

```typescript
// validators/resource.validators.ts
const createResourceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional()
});

// services/resource.service.ts
class ResourceService {
  async create(data: CreateResourceInput): Promise<Resource> {
    // Business logic
  }
}

// repositories/resource.repository.ts
class ResourceRepository {
  async save(resource: Resource): Promise<void> {
    // Database save
  }
}

// controller/resource.controller.ts
class ResourceController {
  async create(req: Request, res: Response) {
    const validated = createResourceSchema.parse(req.body);
    const resource = await resourceService.create(validated);
    res.json(resource);
  }
}

// routes/resource.routes.ts
router.post('/resources', csrfProtection, (req, res) => 
  controller.create(req, res)
);
```

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - See LICENSE file for details
