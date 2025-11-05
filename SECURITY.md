# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in Solopreneur, please report it responsibly to:

**Email**: [melihilker9@gmail.com](mailto:melihilker9@gmail.com)

**Do not** open public GitHub issues for security vulnerabilities.

### Response Timeline
- **Initial Response**: 24 hours
- **Investigation**: 2-5 business days
- **Fix & Release**: 5-14 days depending on severity
- **Public Disclosure**: After fix is released or 90 days, whichever is first

### What to Include
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

---

## Supported Versions

| Version | Status | Supported Until |
|---------|--------|-----------------|
| 1.x (current) | Active | Ongoing |
| 0.x | End of Life | 2025-12-31 |

Security updates are released for the current major version. Older versions receive critical security patches only.

---

## Security Architecture

### 1. Authentication & Session Management

**Stateful Sessions (Redis-based)**
- Sessions stored in Upstash Redis with 7-day TTL
- Maximum 5 concurrent sessions per user
- Instant revocation across all devices
- No tokens stored in client-side storage
- HTTP-only, SameSite=strict cookies

**Password Security**
- Argon2id hashing with secure parameters
- Timing-safe comparison to prevent timing attacks
- Minimum 12 characters, complexity requirements enforced
- Compromised password detection via HIBP integration (future)

**Multi-Factor Authentication**
- Email verification on registration
- 2FA support (planned for v2.0)
- Device fingerprinting for suspicious login detection

### 2. Database Security

**Row Level Security (RLS)**
- All tables have RLS enabled with default-deny policy
- Frontend has zero direct database access
- Backend uses service role key for administrative operations only
- User authorization checked at service layer before any operation

**Data Protection**
- Passwords hashed with Argon2 (never stored plaintext)
- Sensitive fields encrypted at rest (planned)
- HTTPS-only connections
- Encrypted backups with 30-day retention

### 3. API Security

**Rate Limiting**
- Login endpoint: 5 attempts per 15 minutes
- General endpoints: 20 requests per minute
- IP-based and device-based tracking
- Automatic temporary bans for abuse

**Input Validation**
- Zod schemas validate all API inputs
- Type-safe validation at request boundaries
- SQL injection prevention via parameterized queries
- XSS attack prevention through proper escaping

**HTTP Security Headers** (Helmet.js)
- Content-Security-Policy: `default-src 'self'`
- X-Frame-Options: `DENY` (prevent clickjacking)
- X-Content-Type-Options: `nosniff`
- X-XSS-Protection: `1; mode=block`
- Strict-Transport-Security: `max-age=31536000`

**CORS Protection**
- Restricted to configured origins only
- Credentials required for cross-origin requests
- Preflight validation on all non-GET requests

### 4. Brute-Force Protection

**Multi-Layer Defense**
- IP-based rate limiting with 30-minute lockout
- Device fingerprinting with persistent tracking
- Email-specific attempt limits
- Account-level locking after 5 failed attempts

**Honeypot Bot Detection**
- Hidden form fields in registration
- Automatic blocking of bots attempting to fill honeypot
- IP and device automatic blocking on detection

### 5. Infrastructure Security

**Docker Containerization**
- Non-root user execution (uid: 1001, gid: 1001)
- Multi-stage builds minimize image size and attack surface
- Alpine base images for production (smaller image = smaller risk)
- Read-only root filesystem (planned)

**Environment Management**
- Secrets via environment variables only
- `.env` files excluded from version control
- No secrets in logs or error messages
- Separate development and production configurations

**Network Isolation**
- Docker Compose bridges for internal communication
- No direct database exposure to frontend
- API gateway pattern enforces authorization
- Firewall rules for production deployments

### 6. Logging & Monitoring

**Structured Logging** (Pino)
- All requests logged with correlation IDs
- User ID, IP address, and device fingerprint tracked
- Sensitive data (passwords, tokens) never logged
- Separate logs for development vs. production

**Audit Trail**
- All authentication events logged
- Failed login attempts with IP and device tracked
- Administrative actions recorded
- Retention: 90 days

**Monitoring** (future)
- Real-time alerts for suspicious activities
- Automated response to detected attacks
- Weekly security reports

---

## Compliance & Standards

### OWASP Top 10 Protection

| Risk | Mitigation |
|------|-----------|
| Injection | Parameterized queries, input validation with Zod |
| Broken Authentication | Stateful sessions, rate limiting, strong hashing |
| Sensitive Data Exposure | HTTPS, encryption at rest, no client-side storage |
| XML External Entities (XXE) | Not applicable (no XML support) |
| Broken Access Control | RLS, service-layer authorization checks |
| Security Misconfiguration | Environment-based config, minimal dependencies |
| XSS | Proper escaping, CSP headers, Zod validation |
| Insecure Deserialization | Type-safe serialization with TypeScript |
| Using Components with Known Vulnerabilities | Automated dependency scanning, regular updates |
| Insufficient Logging & Monitoring | Structured logging, audit trail, monitoring setup |

### Data Privacy

**GDPR Compliance** (for EU users)
- User consent for data collection
- Right to access personal data
- Right to deletion (data erasure)
- Data portability support
- Privacy policy available to users
- DPA with Supabase for data processing

**Data Retention**
- User data: retained while account is active
- Session data: 7 days
- Logs: 90 days
- Backups: 30 days
- Deleted data: permanently removed within 24 hours

---

## Dependency Security

### Automated Scanning
- `npm audit` runs in CI/CD pipeline
- Dependencies scanned for known vulnerabilities
- Critical vulnerabilities block deployments
- Weekly automated dependency updates (Dependabot)

### Vulnerability Handling Process
1. Vulnerability detected by automated scanning
2. Patch version bump if available
3. Tests run to ensure compatibility
4. Deployment to production
5. Security advisory issued if critical

### Current Dependencies
All dependencies are regularly updated and audited. Security-critical packages:
- **Argon2**: Password hashing - regularly patched
- **Helmet.js**: Security headers - maintained by Express.js team
- **Zod**: Input validation - actively maintained
- **Supabase**: Database - SOC 2 Type II certified

---

## Security Testing

### Pre-Release Checklist
- [ ] OWASP vulnerability scan
- [ ] Dependency audit clean
- [ ] Rate limiting tests passed
- [ ] Authentication flow tested
- [ ] RLS policies verified
- [ ] Error handling checked (no data leakage)
- [ ] CORS configuration tested
- [ ] Logging verified (no sensitive data)

### Penetration Testing
- Annual third-party security audit (planned)
- Bug bounty program (planned for v2.0)
- Community security reports welcome

---

## Known Limitations

1. **Client-Side Security**: Frontend validation is client-side only - backend validation is authoritative
2. **HTTPS**: Certificate validation depends on deployment environment
3. **Rate Limiting**: Based on IP/device - proxy environments may affect accuracy
4. **Session Hijacking**: Mitigated but not eliminated - use HTTPS in production
5. **DDoS Protection**: Basic rate limiting only - additional CDN protection recommended

---

## Security Updates & Patches

### Release Cycle
- **Security Patches**: Released as-needed for critical issues
- **Minor Updates**: Monthly security-related updates
- **Major Updates**: Quarterly security improvements

### Update Instructions
```bash
# Check for updates
git pull origin main

# Install security patches
npm audit fix
npm install

# Rebuild and test
npm run build
docker-compose up --build
```

---

## Responsible Disclosure

We appreciate security researchers who help us maintain the security of Solopreneur. If you discover a vulnerability:

1. **Report immediately** to security contacts
2. **Don't exploit** the vulnerability beyond proving its existence
3. **Keep it confidential** until we release a fix
4. **Provide details** to help us understand and fix the issue

Researchers who follow these guidelines will be:
- Credited in security advisories (if desired)
- Added to acknowledgments page
- Considered for future bug bounty program

---

## Contact & Resources

- **Security Issues**: [melihilker9@gmail.com](mailto:melihilker9@gmail.com)
- **Code Issues**: GitHub Issues
- **Documentation**: See [README.md](README.md)
- **Architecture**: See README.md Architecture section

---

## Security Policy Version

**Version**: 1.0  
**Last Updated**: November 5, 2025  
**Next Review**: May 5, 2026

---

**Built with security as a foundational principle, not an afterthought.**
