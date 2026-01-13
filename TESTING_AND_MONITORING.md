# Testing and Monitoring Guide

This guide covers how to generate reports for load testing, code coverage, security scanning (VAPT), and Sentry error monitoring.

## Table of Contents

1. [Load Testing](#1-load-testing)
2. [Code Coverage](#2-code-coverage)
3. [VAPT Security Scanning](#3-vapt-security-scanning)
4. [Sentry Error Monitoring](#4-sentry-error-monitoring)

---

## 1. Load Testing

We use **k6** for load testing the API endpoints.

### Installation

```bash
# macOS
brew install k6

# Windows (with Chocolatey)
choco install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Running Load Tests

```bash
# Navigate to workers directory
cd workers

# Basic test run
k6 run scripts/load-test.js

# Custom virtual users and duration
k6 run --vus 50 --duration 2m scripts/load-test.js

# Export JSON report
k6 run --out json=reports/load-test-results.json scripts/load-test.js

# Test against different environment
API_URL=https://staging-api.grubtech.com k6 run scripts/load-test.js
```

### Understanding Results

The load test checks:
- **Health endpoints**: Response time < 100ms (p95)
- **Integrations API**: Response time < 300ms (p95)
- **Testimonials API**: Response time < 200ms (p95)
- **Error rate**: < 1% failures
- **Throughput**: Requests per second

### Sample Output

```
================================================================================
                         GRUBTECH API LOAD TEST REPORT
================================================================================

Test Duration: 300s
Total Requests: 15,234
Failed Requests: 12
Error Rate: 0.08%

HTTP Request Duration:
  - Average: 145.23ms
  - Median:  98.45ms
  - p(90):   234.12ms
  - p(95):   312.45ms
  - p(99):   489.23ms
  - Max:     1234.56ms

Throughput: 50.78 req/s

Thresholds:
  ✓ http_req_duration p(95)<500
  ✓ http_req_failed rate<0.01
  ✓ integrations_duration p(95)<300
  ✓ testimonials_duration p(95)<200
  ✓ health_duration p(95)<100
================================================================================
```

---

## 2. Code Coverage

Code coverage is configured using **Vitest** with V8 coverage provider.

### Running Coverage Tests

```bash
# Backend (Workers)
cd workers
npm run test:coverage

# Frontend
cd frontend
npm run test:coverage
```

### Coverage Report Locations

After running, reports are generated in:
- **workers/coverage/** - Backend coverage
- **frontend/coverage/** - Frontend coverage

### Report Formats

- **Text**: Console output with summary
- **HTML**: Interactive report at `coverage/index.html`
- **JSON**: Machine-readable at `coverage/coverage-final.json`

### Viewing HTML Report

```bash
# Backend
open workers/coverage/index.html

# Frontend
open frontend/coverage/index.html
```

### Coverage Thresholds

The project aims for:
- **Statements**: > 70%
- **Branches**: > 60%
- **Functions**: > 70%
- **Lines**: > 70%

### Sample Output

```
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |   78.45 |    65.23 |   82.14 |   79.12 |
 src/routes            |   85.23 |    72.45 |   88.89 |   86.45 |
  auth.ts              |   92.31 |    85.71 |   100.0 |   93.33 |
  integrations.ts      |   88.46 |    75.00 |   90.00 |   89.29 |
  leads.ts             |   76.19 |    60.00 |   80.00 |   77.78 |
 src/middleware        |   72.34 |    58.33 |   75.00 |   73.91 |
 src/services          |   68.42 |    54.55 |   70.00 |   69.23 |
-----------------------|---------|----------|---------|---------|
```

---

## 3. VAPT Security Scanning

We provide a comprehensive security scanning script using free tools.

### Prerequisites

Install the security tools:

```bash
# Docker (for OWASP ZAP)
brew install docker

# Nikto (web server scanner)
brew install nikto

# Nuclei (vulnerability scanner)
brew install nuclei
```

### Running Security Scan

```bash
cd workers

# Full security scan
./scripts/security-scan.sh

# Quick scan (custom checks only)
./scripts/security-scan.sh --quick
```

### Tools Included

| Tool | Purpose | Installation |
|------|---------|--------------|
| **Custom Checks** | Security headers, CORS, auth tests | Built-in (no install needed) |
| **OWASP ZAP** | Web application security scanner | Docker |
| **Nikto** | Web server vulnerability scanner | `brew install nikto` |
| **Nuclei** | Fast vulnerability scanner | `brew install nuclei` |

### Report Location

Reports are saved to `workers/reports/security/`:

```
reports/security/
├── custom-checks-20260113_120000.txt
├── zap-report-20260113_120000.html
├── nikto-report-20260113_120000.txt
├── nuclei-report-20260113_120000.txt
└── summary-20260113_120000.md
```

### Security Checks Performed

1. **Security Headers**
   - X-Content-Type-Options
   - X-Frame-Options
   - Strict-Transport-Security
   - X-XSS-Protection
   - Referrer-Policy
   - Permissions-Policy

2. **CORS Configuration**
   - Checks for overly permissive origins

3. **Information Disclosure**
   - Server header exposure
   - X-Powered-By header

4. **Authentication Security**
   - Rate limiting on login
   - Error message verbosity

5. **Common Vulnerabilities**
   - SQL Injection
   - Path Traversal
   - XSS (Reflected)

6. **Cookie Security**
   - HttpOnly flag
   - Secure flag
   - SameSite attribute

### Sample Output

```
============================================
Custom Security Checks Report
Generated: Mon Jan 13 12:00:00 2026
============================================

=== Security Headers Check ===
[PASS] X-Content-Type-Options header present
[PASS] X-Frame-Options header present
[PASS] Strict-Transport-Security header present
[PASS] X-XSS-Protection header present
[PASS] Referrer-Policy header present
[PASS] Permissions-Policy header present

=== CORS Configuration Check ===
[PASS] CORS does not allow arbitrary origins

=== Information Disclosure Check ===
[PASS] Server header not exposed
[PASS] X-Powered-By header not exposed

=== Authentication Security Check ===
[PASS] Rate limiting is active on authentication endpoint
[PASS] No verbose error messages in authentication response

=== Common Vulnerability Check ===
[PASS] No obvious SQL injection vulnerability
[PASS] Path traversal blocked
[PASS] XSS payloads appear to be handled

=== Cookie Security Check ===
[PASS] Cookies have HttpOnly flag
[PASS] Cookies have Secure flag
[PASS] Cookies have SameSite attribute

=== Custom Checks Complete ===
```

---

## 4. Sentry Error Monitoring

Sentry provides real-time error tracking and performance monitoring.

### Setup

#### 1. Create Sentry Account

1. Go to [https://sentry.io](https://sentry.io) and sign up (free tier available)
2. Create a new project for "React" (frontend) and "Node.js" (backend)
3. Copy the DSN from Project Settings > Client Keys

#### 2. Configure Frontend

Add to your `.env` file:

```env
VITE_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/1234567
VITE_ENABLE_SENTRY=true
VITE_APP_VERSION=1.0.0
```

Add to Cloudflare Pages environment variables:
- `VITE_SENTRY_DSN`: Your Sentry DSN
- `VITE_ENABLE_SENTRY`: `true`

#### 3. Configure Backend (Workers)

Add secret to wrangler:

```bash
# Set Sentry DSN as a secret
wrangler secret put SENTRY_DSN
# Paste your DSN when prompted
```

Or add to `wrangler.toml` for non-sensitive environments:

```toml
[vars]
# Don't put real DSN here - use secrets instead
# SENTRY_DSN = "https://..."
```

#### 4. Integrate with Workers

Update your error handler in `workers/src/index.ts`:

```typescript
import { createSentryClient } from './lib/sentry';

// In your error handler
app.onError(async (err, c) => {
  const sentry = createSentryClient(c.env);

  if (sentry) {
    await sentry.captureException(err, {
      request: c.req.raw,
      tags: {
        route: c.req.path,
        method: c.req.method,
      },
    });
  }

  // ... rest of error handling
});
```

### Sentry Dashboard Features

1. **Issues** - View all errors grouped by type
2. **Performance** - Transaction traces and slow endpoints
3. **Releases** - Track errors by deployment
4. **Alerts** - Set up notifications for new errors

### Viewing Errors

1. Go to [https://sentry.io](https://sentry.io)
2. Select your project
3. View Issues tab for errors
4. Click on any issue to see:
   - Stack trace
   - User context
   - Request details
   - Breadcrumbs (user actions before error)

### Sample Sentry Alert Configuration

```yaml
# Alert when error rate exceeds threshold
Name: High Error Rate
Conditions:
  - When the number of events in a 1 hour period is above 100
Actions:
  - Send email to team@grubtech.com
  - Send Slack notification to #alerts
```

---

## Quick Reference Commands

```bash
# Load Testing
k6 run workers/scripts/load-test.js

# Code Coverage
cd workers && npm run test:coverage
cd frontend && npm run test:coverage

# Security Scan
./workers/scripts/security-scan.sh

# View Coverage Reports
open workers/coverage/index.html
open frontend/coverage/index.html

# View Security Reports
open workers/reports/security/summary-*.md
```

---

## CI/CD Integration

Add these to your GitHub Actions workflow:

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd workers && npm ci
          cd ../frontend && npm ci

      - name: Run tests with coverage
        run: |
          cd workers && npm run test:coverage
          cd ../frontend && npm run test:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        with:
          files: ./workers/coverage/coverage-final.json,./frontend/coverage/coverage-final.json

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run OWASP ZAP Scan
        uses: zaproxy/action-baseline@v0.10.0
        with:
          target: 'https://grubtech-api.shady-ehab.workers.dev'

  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run k6 load test
        uses: grafana/k6-action@v0.3.1
        with:
          filename: workers/scripts/load-test.js
```

---

## Need Help?

- **k6 Documentation**: https://k6.io/docs/
- **Vitest Coverage**: https://vitest.dev/guide/coverage.html
- **OWASP ZAP**: https://www.zaproxy.org/docs/
- **Sentry Docs**: https://docs.sentry.io/
