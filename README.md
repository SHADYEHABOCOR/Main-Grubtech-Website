# Grubtech Website

> Modern, multi-language website for Grubtech's restaurant management platform

[![Node.js Version](https://img.shields.io/badge/node-20.x-brightgreen.svg)](https://nodejs.org/)
[![npm Version](https://img.shields.io/badge/npm-%3E%3D9.0.0-blue.svg)](https://www.npmjs.com/)
[![Cloudflare](https://img.shields.io/badge/deploy-cloudflare-orange.svg)](https://www.cloudflare.com/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#prerequisites)
- [Development](#-development)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

---

## Overview

The **Grubtech Website** is a comprehensive web platform showcasing Grubtech's restaurant management solutions. Built with modern web technologies and deployed on Cloudflare's global network for maximum performance and reliability.

Grubtech provides cloud-based point-of-sale (POS) systems, delivery integrations, and restaurant operations management tools designed to streamline workflows for restaurants, cloud kitchens, and food service businesses across the Middle East and beyond.

### Architecture

This is a **monorepo** containing:

- **Frontend** (`/frontend`): React 18 single-page application
  - Multi-language support (English, Arabic, Spanish, Portuguese)
  - Responsive design with Tailwind CSS
  - Smooth animations with Framer Motion
  - SEO optimization and PWA capabilities
  - Deployed to **Cloudflare Pages**

- **Workers** (`/workers`): Cloudflare Workers API
  - RESTful API built with Hono framework
  - Cloudflare D1 (SQLite) database
  - R2 object storage for file uploads
  - Email integration and rate limiting
  - JWT-based authentication
  - Deployed to **Cloudflare Workers**

### Key Features

- 🌍 **Multi-language Support**: Full internationalization with i18next (4 languages)
- 🎨 **Modern Design**: Tailwind CSS with custom design system and Framer Motion animations
- 📱 **Responsive**: Mobile-first design that works seamlessly across all devices
- ⚡ **Edge Computing**: Cloudflare Workers for ultra-low latency worldwide
- 🔒 **Secure**: Comprehensive security with rate limiting, CORS, and input validation
- 📊 **Analytics Ready**: Performance monitoring and analytics
- 🚀 **Auto-Deploy**: CI/CD via GitHub Actions

---

## 🛠️ Tech Stack

### Frontend

| Category | Technologies |
|----------|-------------|
| **Core** | React 18.3, TypeScript 5.5, Vite 5.4 |
| **Styling** | Tailwind CSS 3.4, PostCSS, Autoprefixer |
| **Animation** | Framer Motion 11.0, Lenis (smooth scroll) |
| **Routing** | React Router DOM 6.22 |
| **State & Data** | TanStack React Query 5.90, Axios 1.12 |
| **i18n** | i18next 23.10, react-i18next 14.0.5 |
| **SEO** | React Helmet Async 2.0.5 |
| **PWA** | Vite Plugin PWA 1.1 |
| **Testing** | Vitest 4.0, Testing Library |

### Workers (Backend)

| Category | Technologies |
|----------|-------------|
| **Framework** | Hono 4.6 (fast web framework) |
| **Runtime** | Cloudflare Workers |
| **Database** | Cloudflare D1 (SQLite) |
| **Storage** | Cloudflare R2 (S3-compatible) |
| **Authentication** | JWT, bcrypt-edge |
| **Validation** | Zod 3.24, Hono Zod Validator |
| **Testing** | Vitest 2.1, Cloudflare Workers Vitest Pool |
| **Language** | TypeScript 5.7 |

### Infrastructure

| Component | Technology |
|-----------|-----------|
| **Hosting** | Cloudflare Pages (Frontend) + Workers (API) |
| **Database** | Cloudflare D1 (SQLite at the edge) |
| **Storage** | Cloudflare R2 (Object storage) |
| **CDN** | Cloudflare Global Network (300+ cities) |
| **CI/CD** | GitHub Actions |
| **Deployment** | Wrangler CLI |

---

## 📁 Project Structure

```
grubtech-website/
├── frontend/                    # React + Vite frontend
│   ├── public/
│   │   ├── _headers            # Cloudflare Pages headers
│   │   └── _redirects          # Cloudflare Pages redirects
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API services
│   │   ├── i18n/               # Translations (en, ar, es, pt)
│   │   └── ...
│   ├── vite.config.ts
│   └── package.json
│
├── workers/                     # Cloudflare Workers API
│   ├── src/
│   │   ├── index.ts            # Main worker entry
│   │   ├── routes/             # API route handlers
│   │   │   ├── auth.ts
│   │   │   ├── blog.ts
│   │   │   ├── leads.ts
│   │   │   └── ...
│   │   ├── middleware/         # Auth, logging, rate limiting
│   │   ├── services/           # Email, cache, storage
│   │   ├── db/                 # Database queries
│   │   └── __tests__/          # Unit tests
│   ├── migrations/             # D1 database migrations
│   ├── wrangler.toml           # Cloudflare Workers config
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy-cloudflare.yml  # CI/CD pipeline
│
├── package.json                # Root workspace config
└── README.md
```

---

## Prerequisites

- **Node.js**: 20.x (LTS)
- **npm**: >=9.0.0
- **Cloudflare Account**: Free tier available at [dash.cloudflare.com](https://dash.cloudflare.com)
- **Wrangler CLI**: Cloudflare's deployment tool

---

## 🚀 Development

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/grubtech-website.git
cd grubtech-website
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + workers)
npm install
```

### 3. Set Up Environment Variables

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8787
VITE_SENTRY_DSN=your_sentry_dsn
```

**Workers** (`workers/.env`):
```env
# Created automatically by Wrangler
# Secrets managed via: wrangler secret put <KEY>
```

### 4. Run Development Servers

**Option A: Run both (recommended)**
```bash
npm run dev
```

**Option B: Run separately**
```bash
# Terminal 1 - Frontend (http://localhost:5173)
cd frontend
npm run dev

# Terminal 2 - Workers (http://localhost:8787)
cd workers
npm run dev
```

### 5. Development URLs

- Frontend: http://localhost:5173
- Workers API: http://localhost:8787
- Wrangler Dashboard: Check terminal output

### Available Commands

```bash
# Root level
npm run dev              # Start both frontend and workers
npm run build            # Build both projects
npm run test             # Run all tests
npm run lint             # Lint all code

# Frontend only
cd frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run test             # Run tests
npm run lint             # Lint code
npm run typecheck        # Type check

# Workers only
cd workers
npm run dev              # Start local worker
npm run dev:remote       # Start remote worker
npm run deploy           # Deploy to production
npm run deploy:staging   # Deploy to staging
npm run test             # Run tests
npm run typecheck        # Type check
npm run db:migrate       # Run D1 migrations
```

---

## 🚀 Deployment

### Automated Deployment (CI/CD)

The project uses GitHub Actions for automated deployments:

1. **Push to `main`** → Deploys to production
2. **Push to `develop`** → Deploys to staging
3. **Pull Request** → Runs tests and preview deployment

### Manual Deployment

**1. Install Wrangler**
```bash
npm install -g wrangler
```

**2. Login to Cloudflare**
```bash
wrangler login
```

**3. Deploy Workers**
```bash
cd workers
npm run deploy              # Production
npm run deploy:staging      # Staging
```

**4. Deploy Frontend**
```bash
cd frontend
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=grubtech-website
```

### Database Migrations

```bash
cd workers

# Run migrations on production
wrangler d1 execute grubtech-db --file=./migrations/0001_initial_schema.sql
wrangler d1 execute grubtech-db --file=./migrations/0002_indexes.sql

# Run migrations locally
npm run db:migrate:local
```

---

## 🔐 Environment Variables

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Workers API URL | Yes |
| `VITE_SENTRY_DSN` | Sentry error tracking | No |

### Workers Secrets

Manage secrets using Wrangler:

```bash
wrangler secret put JWT_SECRET
wrangler secret put ADMIN_PASSWORD
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put SMTP_USER
wrangler secret put SMTP_PASSWORD
```

### Cloudflare Bindings (wrangler.toml)

- **D1 Database**: `DB` binding
- **R2 Storage**: `BUCKET` binding
- **KV Namespace**: `CACHE` binding (optional)

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Frontend tests
cd frontend
npm run test              # Watch mode
npm run test:run          # Single run

# Workers tests
cd workers
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # With coverage
```

---

## 📝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Run tests: `npm test`
4. Run linting: `npm run lint`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📄 License

Proprietary - All rights reserved © Grubtech

---

## 🆘 Support

For issues and questions:
- Open an issue in this repository
- Contact the development team

---

**Built with ❤️ for Grubtech**
