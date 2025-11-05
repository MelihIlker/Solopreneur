# Solopreneur Frontend

Next.js 15 + React 19 client application for Solopreneur project and client management platform. Built with TypeScript, Tailwind CSS, and secure session management.

## 🏗️ Architecture

### Key Design Principles

- **Type Safety**: Full TypeScript with strict mode
- **Performance**: Server components by default, client components where needed
- **Security**: Memory-based session management (no localStorage tokens)
- **DX**: Hot module reloading, instant feedback

### Session & Authentication

**API Client** (`lib/apiClient.ts`):
- Automatic CSRF token fetching per-request
- Session ID passed via `X-Session-ID` header
- CSRF token passed via `X-CSRF-Token` header
- Auth endpoints (`/api/auth/*`) bypass session requirement

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.9 |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| Form Validation | Zod |
| HTTP Client | Native fetch API |
| CSS Framework | Utility-first with Tailwind theme |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:3001`

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Configuration

Create `.env.local` file:

```env
# Backend URL
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3001
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
frontend/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home page
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── register/
│   │   └── page.tsx            # Registration page
│   ├── dashboard/
│   │   ├── layout.tsx          # Protected layout
│   │   ├── page.tsx            # Dashboard home
│   │   ├── projects/
│   │   ├── clients/
│   │   └── settings/
│   └── globals.css             # Global styles
│
├── lib/
│   └── apiClient.ts            # HTTP client with CSRF handling
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   └── common/
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── Footer.tsx
│
├── tailwind.theme.js           # Tailwind configuration
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
└── next.config.ts
```

## 🔐 Security Features

### Session Management

- **HTTP-Only Cookies**: Access token in secure, HTTP-only cookie
- **Per-Tab Isolation**: Each browser tab has unique session context
- **Auto-Refresh**: Session regenerates on page reload

### API Security

- **CSRF Protection**: Token-per-request model
- **Automatic Header Injection**: `apiClient` adds CSRF/Session headers
- **Type-Safe Requests**: Zod validation on responses
- **Error Handling**: Centralized error handling with proper status codes

### Authentication Flow

1. User submits login credentials
2. Backend validates and returns `access_token` (HTTP-only cookie)
3. Frontend detects session via `cookie.get("access_token")?.value`
4. API client automatically includes CSRF token on protected requests
5. Backend validates CSRF token and refreshes it after success

## 📄 Key Components

### `apiClient.ts`

HTTP client wrapper that handles:
- CSRF token generation before each request
- Session ID validation
- Request/response typing
- Error handling

```typescript
import { apiClient } from '@/lib/apiClient';

// Automatic CSRF handling
const response = await apiClient('/api/user/profile', {
  method: 'PUT',
  body: JSON.stringify({ name: 'New Name' })
});
```

## 🎨 Styling

### Tailwind CSS Setup

- Theme customized in `tailwind.theme.js`
- Utilities-first approach
- Mobile-first responsive design
- CSS variable support for theming

### Adding New Styles

```typescript
// Use Tailwind classes directly
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  Click me
</button>

// Extract to components for reusability
// components/ui/Button.tsx
export function Button({ children, ...props }) {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" {...props}>
      {children}
    </button>
  );
}
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

Test files follow the pattern: `*.test.ts` or `*.test.tsx`

### Testing Best Practices

- Mock `apiClient` for HTTP calls
- Test components with React Testing Library
- Test user interactions, not implementation details

Example:

```typescript
import { render, screen } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';

describe('LoginForm', () => {
  it('submits credentials on form submit', async () => {
    render(<LoginForm />);
    
    // Fill form
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    // Assert
    expect(apiClient).toHaveBeenCalledWith('/api/auth/login', expect.any(Object));
  });
});
```

## 📊 State Management

Currently uses React Context + hooks for lightweight state:

```typescript
// Future: Consider Redux or Zustand for complex state
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Connect repo to Vercel
# Auto-deploys on push to main
```

### Docker

```bash
# Build image
docker build -t solopreneur-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_AUTH_API_URL=https://api.solopreneur.com \
  solopreneur-frontend
```

### Environment Variables for Production

```env
NEXT_PUBLIC_AUTH_API_URL=https://api.solopreneur.com
```

## 📚 Development Guidelines

### Code Style

- TypeScript strict mode enabled
- Explicit return types on all functions
- Component names in PascalCase
- Hooks and utilities in camelCase
- ESLint + Prettier for formatting

### Creating New Pages

1. Create folder under `app/`
2. Add `page.tsx` component
3. Create corresponding API client function in `lib/`

### Creating New Components

```typescript
// components/ui/Card.tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}
```

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - See LICENSE file for details
