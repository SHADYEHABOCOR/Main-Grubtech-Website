# Grubtech Website

> Modern, multi-language website for Grubtech's restaurant management platform

[![Node.js Version](https://img.shields.io/badge/node-20.x-brightgreen.svg)](https://nodejs.org/)
[![npm Version](https://img.shields.io/badge/npm-%3E%3D9.0.0-blue.svg)](https://www.npmjs.com/)
[![Monorepo](https://img.shields.io/badge/monorepo-npm%20workspaces-orange.svg)](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites and Installation](#-prerequisites-and-installation)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Installation](#installation)
  - [Quick Start Summary](#quick-start-summary)
- [Development Workflow](#-development-workflow)
  - [Starting Development Servers](#starting-development-servers)
  - [Available Development Commands](#available-development-commands)
  - [Hot Reloading and Development Experience](#hot-reloading-and-development-experience)
  - [Testing](#testing)
  - [Code Quality Checks](#code-quality-checks)
  - [Common Development Workflows](#common-development-workflows)
  - [Development URLs](#development-urls)
  - [Troubleshooting Development Issues](#troubleshooting-development-issues)
- [Building for Production](#-building-for-production)
  - [Build Commands](#build-commands)
  - [Production Environment Setup](#production-environment-setup)
  - [Deployment to Render](#deployment-to-render)
  - [Alternative Deployment Platforms](#alternative-deployment-platforms)
- [Environment Variables Reference](#-environment-variables-reference)
  - [Backend Environment Variables](#backend-environment-variables)
  - [Frontend Environment Variables](#frontend-environment-variables)
  - [Generating Secure Secrets](#generating-secure-secrets)
  - [Troubleshooting Environment Variables](#troubleshooting-environment-variables)
- [Additional Documentation](#-additional-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

The **Grubtech Website** is a comprehensive web platform showcasing Grubtech's restaurant management solutions. This monorepo houses both the customer-facing marketing website and the backend API that powers it.

Grubtech provides cloud-based point-of-sale (POS) systems, delivery integrations, and restaurant operations management tools designed to streamline workflows for restaurants, cloud kitchens, and food service businesses across the Middle East and beyond.

### What This Repository Contains

This is a **monorepo** containing two main applications:

- **Frontend** (`/frontend`): A modern React 18 single-page application built with Vite, featuring:
  - Multi-language support (English, Arabic, Spanish, Portuguese)
  - Responsive design with Tailwind CSS
  - Smooth animations with Framer Motion
  - SEO optimization with server-side meta tags
  - Progressive Web App (PWA) capabilities
  - Analytics and performance monitoring

- **Backend** (`/backend`): A RESTful API built with Express and TypeScript, providing:
  - Content management endpoints
  - Blog and testimonial management
  - Lead generation and contact forms
  - File upload handling with AWS S3
  - Email notifications via Nodemailer
  - JWT-based authentication for admin features
  - Rate limiting and security middleware

### Key Features

- 🌍 **Multi-language Support**: Full internationalization with i18next (4 languages)
- 🎨 **Modern Design**: Tailwind CSS with custom design system and Framer Motion animations
- 📱 **Responsive**: Mobile-first design that works seamlessly across all devices
- ⚡ **High Performance**: Built with Vite for lightning-fast development and optimized production builds
- 🔒 **Secure**: Comprehensive security measures including helmet, CORS, rate limiting, and input validation
- 📊 **Analytics Ready**: Integrated with Sentry for error tracking and Web Vitals for performance monitoring
- 🚀 **Production Ready**: Deployed on Render with automated CI/CD via `render.yaml`

---

## 🛠️ Tech Stack

### Frontend

The frontend is a modern React application built with cutting-edge technologies for optimal performance and developer experience.

| Category | Technologies |
|----------|-------------|
| **Core** | React 18.3, TypeScript 5.5, Vite 5.4 |
| **Styling** | Tailwind CSS 3.4, PostCSS, Autoprefixer |
| **Animation** | Framer Motion 11.0, Lenis (smooth scroll), OGL (WebGL) |
| **Routing** | React Router DOM 6.22 |
| **State & Data** | TanStack React Query 5.90, Axios 1.12 |
| **i18n** | i18next 23.10, react-i18next 14.0.5 (EN, AR, ES, PT) |
| **UI Components** | Lucide React (icons), Recharts 3.3 (charts) |
| **SEO** | React Helmet Async 2.0.5 |
| **PWA** | Vite Plugin PWA 1.1, Workbox 7.3 |
| **Monitoring** | Sentry 10.32, Web Vitals 5.1 |
| **Security** | DOMPurify 3.3, crypto-js 4.2 |
| **Testing** | Vitest 4.0, Testing Library, jsdom 27.4 |
| **Code Quality** | ESLint 9.9, TypeScript ESLint 8.3 |

### Backend

The backend is a robust RESTful API built with Express and TypeScript, handling authentication, data management, and file operations.

| Category | Technologies |
|----------|-------------|
| **Core** | Express 4.18, TypeScript 5.9, Node.js 20.x |
| **Database** | SQLite (better-sqlite3 9.2) |
| **Authentication** | JWT (jsonwebtoken 9.0), bcryptjs 2.4 |
| **Security** | Helmet 8.1, CORS 2.8, express-rate-limit 8.2 |
| **Validation** | express-validator 7.3, Zod 4.3, validator 13.15 |
| **File Storage** | AWS S3 SDK 3.962, Multer 1.4.5, Sharp 0.34 (image processing) |
| **Email** | Nodemailer 7.0 |
| **Logging** | Winston 3.19 |
| **Testing** | Vitest 4.0, Supertest 7.0, jsdom 27.4 |
| **Dev Tools** | tsx 4.21, ts-node 10.9, nodemon 3.1 |

### DevOps & Infrastructure

| Component | Technology | Description |
|-----------|-----------|-------------|
| **Hosting** | Render | Cloud platform for automated deployments |
| **Deployment** | render.yaml | Infrastructure as code configuration |
| **Storage** | AWS S3 | File and image storage in production |
| **CDN** | CloudFront (optional) | Content delivery network for static assets |
| **Email Service** | SMTP | Configurable (Gmail, SendGrid, etc.) |
| **Build Tool** | Vite 5.4 | Lightning-fast builds and HMR |
| **Package Manager** | npm workspaces | Monorepo management |
| **CI/CD** | Render Auto-Deploy | Automated deployments from git push |

### Requirements

- **Node.js**: 20.x (LTS)
- **npm**: >=9.0.0
- **Environment**: Unix-based system (Linux/macOS) or WSL2 for Windows

---

## 📁 Project Structure

This is a **monorepo** using npm workspaces to manage both frontend and backend applications in a single repository.

```
grubtech-website/
├── frontend/                    # React + Vite frontend application
│   ├── public/                 # Static assets (favicon, manifest, robots.txt)
│   ├── src/
│   │   ├── main.tsx           # Application entry point
│   │   ├── App.tsx            # Root App component
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Reusable UI components (Button, Card, etc.)
│   │   │   ├── sections/     # Page sections (Hero, CTA, FAQ, etc.)
│   │   │   ├── forms/        # Form components
│   │   │   ├── modals/       # Modal dialogs
│   │   │   ├── admin/        # Admin panel components
│   │   │   └── ...           # Other component categories
│   │   ├── pages/            # Route-level page components
│   │   │   ├── Home.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Solutions/    # Solution pages
│   │   │   ├── Blog/         # Blog pages
│   │   │   ├── Admin/        # Admin pages
│   │   │   └── ...
│   │   ├── hooks/            # Custom React hooks (18 hooks)
│   │   │   ├── useFetch.ts
│   │   │   ├── useForm.ts
│   │   │   ├── useContent.ts
│   │   │   └── ...
│   │   ├── services/         # API integration services
│   │   │   ├── blogService.ts
│   │   │   ├── contactService.ts
│   │   │   └── ...
│   │   ├── i18n/             # Internationalization
│   │   │   ├── config.ts
│   │   │   ├── en.json       # English translations
│   │   │   ├── ar.json       # Arabic translations
│   │   │   ├── es.json       # Spanish translations
│   │   │   └── pt.json       # Portuguese translations
│   │   ├── context/          # React Context providers
│   │   │   ├── AdminContext.tsx
│   │   │   └── LanguageContext.tsx
│   │   ├── utils/            # Helper functions and utilities
│   │   ├── types/            # TypeScript type definitions
│   │   ├── lib/              # Third-party configurations
│   │   │   ├── queryClient.ts
│   │   │   ├── sentry.ts
│   │   │   └── DESIGN_SYSTEM.md
│   │   ├── assets/           # Images, icons, logos
│   │   └── config/           # App configuration
│   ├── vite.config.ts        # Vite build configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── package.json          # Frontend dependencies
│
├── backend/                    # Express + TypeScript backend API
│   ├── src/
│   │   ├── server.ts         # Express server entry point
│   │   ├── routes/           # API route handlers (15 route modules)
│   │   │   ├── auth.ts       # Authentication endpoints
│   │   │   ├── blog.ts       # Blog endpoints
│   │   │   ├── careers.ts
│   │   │   ├── integrations.ts
│   │   │   ├── leads.ts
│   │   │   ├── testimonials.ts
│   │   │   └── ...
│   │   ├── middleware/       # Express middleware
│   │   │   ├── auth.ts       # JWT authentication
│   │   │   ├── security.ts   # Security headers, rate limiting
│   │   │   └── errorHandler.ts
│   │   ├── services/         # Business logic
│   │   │   ├── emailService.ts    # Nodemailer email service
│   │   │   └── storage.ts         # AWS S3 storage service
│   │   ├── db/               # Database initialization
│   │   ├── config/           # Backend configuration
│   │   │   ├── database.ts
│   │   │   ├── env.ts
│   │   │   └── logger.ts
│   │   └── utils/            # Utility functions
│   ├── migrations/           # Database migrations
│   ├── scripts/              # Utility scripts
│   │   └── create-admin.ts
│   ├── uploads/              # File upload storage
│   ├── tsconfig.json         # TypeScript configuration
│   └── package.json          # Backend dependencies
│
├── .auto-claude/             # Auto-Claude automation files
├── package.json              # Root monorepo scripts
├── render.yaml               # Render deployment configuration
└── .env.example             # Environment variables template
```

### Directory Explanations

#### Frontend (`/frontend`)

| Directory | Description |
|-----------|-------------|
| **`src/components/`** | Reusable React components organized by feature (60+ components). Includes UI primitives, page sections, forms, modals, and admin components. |
| **`src/pages/`** | Route-level page components (15+ pages) for React Router. Each page corresponds to a URL route. |
| **`src/hooks/`** | Custom React hooks (18 hooks) for reusable logic like data fetching (`useFetch`), form handling (`useForm`), animations (`useScrollAnimation`), and responsive design (`useResponsive`). |
| **`src/services/`** | API integration services using Axios and React Query. Handles all backend communication. |
| **`src/i18n/`** | Internationalization configuration with i18next. Supports 4 languages: English, Arabic, Spanish, and Portuguese. |
| **`src/context/`** | React Context providers for global state management (admin state, language preferences, rate limiting). |
| **`src/utils/`** | Helper functions for validation, sanitization, logging, analytics, SEO, and cookies. |
| **`src/types/`** | TypeScript type definitions and interfaces for type safety. |
| **`src/lib/`** | Third-party library configurations (React Query, Sentry) and design system documentation. |
| **`src/assets/`** | Static assets (images, icons, logos, SVGs) imported by components. |

#### Backend (`/backend`)

| Directory | Description |
|-----------|-------------|
| **`src/routes/`** | Express route handlers (15 modules) defining API endpoints for authentication, blog, careers, integrations, leads, testimonials, and more. |
| **`src/middleware/`** | Express middleware for authentication (JWT), security (helmet, CORS, rate limiting), error handling, and request tracking. |
| **`src/services/`** | Business logic and external service integrations for email (Nodemailer) and file storage (AWS S3). |
| **`src/db/`** | Database initialization scripts for SQLite with better-sqlite3. |
| **`src/config/`** | Configuration modules for database connection, environment variables validation, and Winston logger setup. |
| **`src/utils/`** | Backend utility functions for standardized API responses. |
| **`migrations/`** | SQL migration files for database schema updates. |
| **`scripts/`** | Utility scripts for admin tasks (create admin users, rate limiting tests). |
| **`uploads/`** | Directory for uploaded files (images, documents) before S3 upload. |

### Key Configuration Files

| File | Purpose |
|------|---------|
| **`render.yaml`** | Infrastructure as code for Render deployment. Defines both frontend and backend services, environment variables, build commands, and health checks. |
| **`package.json` (root)** | Monorepo configuration with npm workspaces. Contains scripts to run, build, and test both frontend and backend in parallel. |
| **`vite.config.ts`** | Vite bundler configuration with plugins for PWA, image optimization, bundle analysis, and build settings. |
| **`tailwind.config.js`** | Tailwind CSS theme configuration including custom colors, fonts, spacing, and responsive breakpoints. |
| **`.env.example`** | Template for environment variables required by both frontend and backend (API URLs, database paths, AWS credentials, etc.). |
| **`tsconfig.json`** | TypeScript compiler options for both frontend and backend, ensuring type safety across the codebase. |

---

## 🚀 Prerequisites and Installation

### Prerequisites

Before you begin, ensure you have the following software installed on your system:

| Requirement | Version | Installation | Verification |
|-------------|---------|--------------|--------------|
| **Node.js** | 20.x (LTS) | [nodejs.org](https://nodejs.org/) | `node --version` |
| **npm** | ≥9.0.0 | Comes with Node.js | `npm --version` |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) | `git --version` |

**Optional but Recommended:**
- **AWS Account**: Required if using S3 for file storage in production
- **SMTP Email Account**: Required for email notifications (Gmail, SendGrid, etc.)
- **Code Editor**: VS Code, WebStorm, or your preferred IDE

**Operating System Requirements:**
- Unix-based system (Linux/macOS) recommended
- Windows users should use WSL2 (Windows Subsystem for Linux)

### Environment Setup

This project requires environment variables for both frontend and backend applications. You'll need to create `.env` files based on the provided examples.

#### Backend Environment Variables

1. **Copy the example file:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Edit `backend/.env` and configure the following:**

   **Required Variables (Must be configured):**
   ```bash
   # Server Configuration
   NODE_ENV=development              # Use 'production' for production
   PORT=3001                         # Backend port (default: 3001)

   # Security - CRITICAL: Change these in production!
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-chars
   JWT_EXPIRES_IN=7d

   # CORS - Frontend URL for cross-origin requests
   FRONTEND_URL=http://localhost:5173  # Development: Vite default port

   # Database
   DATABASE_TYPE=sqlite              # Use 'sqlite' for development
   DATABASE_PATH=./grubtech.db       # SQLite database file path
   ```

   **Optional Variables (For production/advanced features):**
   ```bash
   # Setup Admin (ONLY for initial setup - disable after first admin created!)
   ENABLE_SETUP_ADMIN=false          # Security: Keep false in production
   SETUP_SECRET_TOKEN=               # Only needed if ENABLE_SETUP_ADMIN=true
   ADMIN_USERNAME=admin@grubtech.com
   ADMIN_PASSWORD=change-this-secure-password

   # AWS S3 Storage (Production only - uses local storage in development)
   STORAGE_TYPE=local                # Use 's3' for production
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   S3_BUCKET_NAME=

   # Email Configuration (Optional - for contact form notifications)
   EMAIL_ENABLED=false               # Set to 'true' to enable emails
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@grubtech.com
   ADMIN_EMAIL=admin@grubtech.com

   # Logging
   LOG_LEVEL=info                    # Options: error, warn, info, http, debug
   LOG_FORMAT=pretty                 # Use 'json' for production

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000       # 15 minutes in milliseconds
   RATE_LIMIT_MAX_REQUESTS=1000      # Max requests per window

   # Feature Flags
   ENABLE_ANALYTICS=true             # Enable analytics endpoints
   ```

   > ⚠️ **Security Warning**: The `backend/.env.example` file contains extensive documentation about the setup admin feature. Read it carefully before enabling this feature, as it creates security risks if left enabled in production.

#### Frontend Environment Variables

1. **For development (local):**

   The frontend automatically uses `http://localhost:3001` as the API URL in development mode. No `.env` file is required for local development.

2. **For production builds:**
   ```bash
   cp frontend/.env.production.example frontend/.env.production
   ```

   Edit `frontend/.env.production` and configure:
   ```bash
   # Backend API URL - Update with your production backend URL
   VITE_API_URL=https://api.grubtech.com

   # Application Configuration
   VITE_APP_NAME=Grubtech
   VITE_ENABLE_ANALYTICS=true        # Enable analytics tracking
   VITE_ENABLE_LIVE_CHAT=true        # Enable live chat widget
   ```

### Installation

Follow these steps to install and run the project locally:

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd grubtech-website
```

#### 2. Install Dependencies

This monorepo uses npm workspaces. Install all dependencies for both frontend and backend:

```bash
# Install all dependencies (root, frontend, and backend)
npm run install:all
```

**Alternative: Install individually**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
npm run install:frontend

# Install backend dependencies
npm run install:backend
```

#### 3. Configure Environment Variables

Follow the [Environment Setup](#environment-setup) section above to create and configure your `.env` files.

**Minimum required for development:**
- Create `backend/.env` from `backend/.env.example`
- Set `JWT_SECRET` to any secure string (generate using `openssl rand -hex 32`)
- Set `FRONTEND_URL=http://localhost:5173`
- Keep default values for other variables

#### 4. Initialize the Database

The backend uses SQLite for development. The database will be automatically created and initialized on first run.

**Optional: Seed with sample data**
```bash
npm run start:seed
```

This will:
- Create the SQLite database file
- Run migrations to set up tables
- Seed with sample blog posts, testimonials, and integrations

#### 5. Create an Admin User (Optional)

If you want to access the admin panel at `/admin`, create an admin user:

**Method 1: Using the create-admin script (Recommended)**
```bash
cd backend
npm run create-admin
```

Follow the interactive prompts to create an admin user.

**Method 2: Using the setup endpoint (Initial deployment only)**

If `ENABLE_SETUP_ADMIN=true` in your `backend/.env`:

```bash
curl -X POST http://localhost:3001/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"setupToken": "your-setup-secret-token-from-env"}'
```

> ⚠️ **Important**: Disable the setup endpoint immediately after creating your first admin by setting `ENABLE_SETUP_ADMIN=false` in production.

#### 6. Start the Development Servers

**Start both frontend and backend in parallel:**
```bash
npm run dev
```

This will start:
- **Frontend**: `http://localhost:5173` (Vite dev server with HMR)
- **Backend**: `http://localhost:3001` (Express API server)

**Or start them individually:**
```bash
# Start frontend only
npm run dev:frontend

# Start backend only
npm run dev:backend
```

#### 7. Access the Application

- **Frontend Website**: Open [http://localhost:5173](http://localhost:5173) in your browser
- **Admin Panel**: [http://localhost:5173/admin](http://localhost:5173/admin) (requires admin login)
- **Backend API**: [http://localhost:3001/api](http://localhost:3001/api)
- **API Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

#### 8. Verify Installation

**Check that everything is working:**

1. **Frontend loads**: Visit `http://localhost:5173` - you should see the Grubtech homepage
2. **Backend is running**: Visit `http://localhost:3001/api/health` - you should see health status JSON
3. **Hot reloading works**: Edit a file in `frontend/src` and see changes instantly
4. **API connection works**: Navigate through the website - blog, testimonials, etc.

**Common issues:**
- **Port already in use**: Kill the process using port 3001 or 5173, or change ports in configuration
- **Dependencies failed to install**: Clear `node_modules` and run `npm run install:all` again
- **Database errors**: Delete `backend/grubtech.db` and restart the backend to recreate it
- **CORS errors**: Ensure `FRONTEND_URL` in `backend/.env` matches your frontend URL

### Quick Start Summary

For experienced developers, here's the TL;DR:

```bash
# Clone and install
git clone <repository-url>
cd grubtech-website
npm run install:all

# Configure environment (minimum for dev)
cp backend/.env.example backend/.env
# Edit backend/.env: Set JWT_SECRET and FRONTEND_URL=http://localhost:5173

# Start development servers
npm run dev

# Visit http://localhost:5173
```

**Optional: Create admin user and seed data**
```bash
cd backend && npm run create-admin
npm run start:seed
```

---

## 💻 Development Workflow

### Starting Development Servers

The monorepo provides flexible options for running development servers based on your workflow needs.

#### Run Both Frontend and Backend (Recommended)

**Start both servers in parallel with hot reloading:**
```bash
npm run dev
```

This starts:
- **Frontend Dev Server**: `http://localhost:5173` (Vite with HMR)
- **Backend API Server**: `http://localhost:3001` (Express with auto-restart)

Both servers feature automatic reloading:
- **Frontend**: Hot Module Replacement (HMR) updates instantly without page refresh
- **Backend**: Auto-restarts on file changes (< 1 second reload time)

#### Run Frontend Only

**When working exclusively on UI/components:**
```bash
npm run dev:frontend
```

Features:
- ⚡ **Lightning-fast HMR**: Updates reflect in < 100ms
- 🔥 **React Fast Refresh**: Component state preserved during edits
- 🎨 **CSS Hot Reload**: Style changes without page refresh
- 📦 **Dependency Pre-bundling**: Optimized module loading

#### Run Backend Only

**When working exclusively on API/database:**
```bash
npm run dev:backend
```

Features:
- 🔄 **Auto-restart**: Detects TypeScript file changes
- 🚀 **Fast Reload**: Uses `tsx` for instant TypeScript execution
- 🗃️ **SQLite Hot Reload**: Database changes reflected immediately
- 📝 **Source Maps**: Full debugging support in TypeScript

### Available Development Commands

#### Quick Reference Table

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run dev` | Start both dev servers | Daily full-stack development |
| `npm run dev:frontend` | Frontend only | UI/component work |
| `npm run dev:backend` | Backend only | API/database work |
| `npm test` | Run tests in watch mode | Test-driven development |
| `npm run typecheck` | Check TypeScript types | Pre-commit validation |
| `npm run lint` | Lint frontend code | Code quality check |
| `npm run build` | Build for production | Deployment preparation |
| `npm run build:analyze` | Analyze bundle size | Performance optimization |

#### Development Scripts by Workspace

**Root Level (Monorepo Orchestration):**
```bash
npm run dev                 # Start both frontend & backend
npm run dev:frontend        # Start frontend only
npm run dev:backend         # Start backend only
npm run install:all         # Install all dependencies
npm run build               # Build both for production
npm run typecheck           # Type check frontend
npm run lint                # Lint frontend code
```

**Frontend Workspace (`cd frontend`):**
```bash
npm run dev                 # Vite dev server
npm run build               # Production build
npm run build:analyze       # Build with bundle analysis
npm run preview             # Preview production build
npm test                    # Run tests in watch mode
npm run test:run            # Run tests once (CI mode)
npm run test:coverage       # Run tests with coverage
npm run typecheck           # TypeScript type checking
npm run lint                # ESLint code checking
```

**Backend Workspace (`cd backend`):**
```bash
npm run dev                 # Express dev server
npm run build               # Compile TypeScript
npm start                   # Start production server
npm run start:seed          # Seed DB + start server
npm run seed                # Seed database only
npm run create-admin        # Create admin user (interactive)
npm test                    # Run tests in watch mode
npm run test:run            # Run tests once (CI mode)
npm run test:coverage       # Run tests with coverage
npm run typecheck           # TypeScript type checking
```

### Hot Reloading and Development Experience

#### Frontend Hot Module Replacement (HMR)

The frontend uses **Vite's HMR** for an exceptional development experience:

**What gets hot reloaded:**
- ✅ React components (state preserved)
- ✅ CSS/Tailwind styles (instant updates)
- ✅ TypeScript/JavaScript modules
- ✅ i18n translation files
- ✅ Configuration changes (some require restart)

**How it works:**
1. Save any file in `frontend/src/`
2. Vite detects the change
3. Updates are injected without page refresh
4. Component state is preserved (React Fast Refresh)
5. See changes in < 100ms

**Example workflow:**
```bash
# 1. Start dev server
npm run dev:frontend

# 2. Edit a component: frontend/src/components/ui/Button.tsx
# 3. Save the file (Cmd/Ctrl + S)
# 4. See changes instantly in browser - NO REFRESH NEEDED!
```

**Full page reload triggers:**
- Editing `index.html`
- Changing `vite.config.ts`
- Modifying `.env` files
- Syntax errors (error overlay shows in browser)

#### Backend Auto-Restart

The backend uses **tsx watch mode** for fast TypeScript execution:

**What triggers restart:**
- ✅ TypeScript file changes in `backend/src/`
- ✅ Environment variable changes (`.env`)
- ✅ Database migrations
- ✅ Configuration updates

**Restart speed:** < 1 second

**How it works:**
1. Save any file in `backend/src/`
2. `tsx` detects the change
3. Server restarts automatically
4. New changes available on next API request

**Example workflow:**
```bash
# 1. Start dev server
npm run dev:backend

# 2. Edit a route: backend/src/routes/blog.ts
# 3. Save the file
# 4. Server restarts automatically
# 5. Test API endpoint - changes are live!
```

### Testing

The project uses **Vitest** for both frontend and backend testing, providing a fast, modern testing experience with Jest-compatible APIs.

#### Running Tests

**Watch Mode (Recommended for Development):**

Run tests continuously with automatic re-runs on file changes:

```bash
# Frontend tests in watch mode
cd frontend
npm test

# Backend tests in watch mode
cd backend
npm test
```

**Features:**
- 🔄 Auto-runs tests when files change
- 🎯 Filters tests by filename or pattern
- 📊 Interactive test UI in terminal
- ⚡ Only re-runs affected tests

**Single Run (CI/CD Mode):**

Run all tests once and exit:

```bash
# Frontend tests (single run)
cd frontend
npm run test:run

# Backend tests (single run)
cd backend
npm run test:run
```

**Use cases:**
- Pre-commit hooks
- CI/CD pipelines
- Quick validation before push

#### Test Coverage

Generate comprehensive coverage reports:

```bash
# Frontend coverage
cd frontend
npm run test:coverage

# Backend coverage
cd backend
npm run test:coverage
```

**Coverage reports include:**
- 📊 Line coverage
- 🔀 Branch coverage
- 🎯 Function coverage
- 📝 Statement coverage

**Output locations:**
- Frontend: `frontend/coverage/index.html`
- Backend: `backend/coverage/index.html`

**View coverage in browser:**
```bash
# After running coverage commands
open frontend/coverage/index.html
open backend/coverage/index.html
```

#### Testing Frameworks & Libraries

**Frontend Testing Stack:**
- **Vitest**: Test runner and framework
- **Testing Library**: React component testing utilities
- **jsdom**: DOM environment simulation
- **User Event**: User interaction simulation
- **Coverage**: V8 coverage provider

**Backend Testing Stack:**
- **Vitest**: Test runner and framework
- **Supertest**: HTTP assertion library for API testing
- **jsdom**: Environment simulation
- **Coverage**: V8 coverage provider

#### Test File Locations

**Frontend:**
```
frontend/src/
├── components/__tests__/      # Component tests
├── hooks/__tests__/           # Custom hook tests
├── utils/__tests__/           # Utility function tests
└── services/__tests__/        # API service tests
```

**Backend:**
```
backend/src/
├── routes/__tests__/          # Route/endpoint tests
├── middleware/__tests__/      # Middleware tests
├── services/__tests__/        # Service layer tests
└── utils/__tests__/           # Utility function tests
```

#### Writing Tests

**Test file naming conventions:**
- `*.test.ts` - Unit tests
- `*.test.tsx` - Component tests
- `*.spec.ts` - Integration tests

**Example test structure:**
```typescript
import { describe, it, expect } from 'vitest';

describe('Component/Function Name', () => {
  it('should do something specific', () => {
    // Arrange: Set up test data
    // Act: Execute the code
    // Assert: Verify the results
    expect(result).toBe(expected);
  });
});
```

### Code Quality Checks

#### Type Checking

Run TypeScript type checking without compilation:

```bash
# From root (checks frontend)
npm run typecheck

# Frontend only
cd frontend
npm run typecheck

# Backend only
cd backend
npm run typecheck
```

**What it checks:**
- Type correctness across all files
- Type compatibility
- Missing type definitions
- Interface implementations

**When to run:**
- Before committing code
- After adding new dependencies
- When debugging type errors
- In CI/CD pipelines

#### Linting

Check code style and potential issues:

```bash
# From root (lints frontend)
npm run lint

# Frontend only
cd frontend
npm run lint
```

**ESLint checks:**
- React hooks rules
- TypeScript best practices
- Unused variables and imports
- Code style consistency
- Potential bugs

### Common Development Workflows

#### 1. Daily Development (Full Stack)

```bash
# Terminal 1: Start dev servers
npm run dev

# Terminal 2: Run tests in watch mode
cd frontend && npm test

# Terminal 3: Available for git commands, debugging, etc.
```

**Workflow:**
1. Edit files in `frontend/src/` or `backend/src/`
2. Changes hot reload automatically
3. Tests re-run on file save
4. Check browser console and terminal for errors

#### 2. Frontend-Only Development

```bash
# Terminal 1: Start frontend
npm run dev:frontend

# Terminal 2: Run frontend tests
cd frontend && npm test

# Optional Terminal 3: Type checking
cd frontend && npm run typecheck
```

**Perfect for:**
- UI component development
- Styling and animations
- Frontend-only features
- Design system work

#### 3. Backend-Only Development

```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Run backend tests
cd backend && npm test

# Terminal 3: Test API endpoints
curl http://localhost:3001/api/health
```

**Perfect for:**
- API endpoint development
- Database operations
- Business logic implementation
- Backend services

#### 4. Pre-Commit Checklist

Before committing, ensure code quality:

```bash
# 1. Type check
npm run typecheck

# 2. Lint code
npm run lint

# 3. Run all tests
cd frontend && npm run test:run
cd backend && npm run test:run

# 4. Check for uncommitted changes
git status
```

#### 5. Debugging Workflow

**Frontend debugging:**
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Check Console tab for errors
3. Use React DevTools for component inspection
4. Check Network tab for API calls
5. Use Vite's error overlay for build errors

**Backend debugging:**
1. Check terminal output for server logs
2. Use `console.log()` or debugger statements
3. Test API endpoints with curl or Postman:
   ```bash
   curl -X GET http://localhost:3001/api/health
   ```
4. Check SQLite database:
   ```bash
   sqlite3 backend/grubtech.db "SELECT * FROM users;"
   ```

### Development URLs

When running in development mode, access the application at:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main website |
| **Admin Panel** | http://localhost:5173/admin | Admin dashboard (requires login) |
| **Backend API** | http://localhost:3001/api | REST API endpoints |
| **Health Check** | http://localhost:3001/api/health | API health status |
| **Blog API** | http://localhost:3001/api/blog | Blog posts endpoint |
| **Testimonials** | http://localhost:3001/api/testimonials | Testimonials endpoint |

### Troubleshooting Development Issues

#### Port Already in Use

```bash
# Find process using port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Find process using port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Or change port in configuration
# Frontend: vite.config.ts -> server.port
# Backend: .env -> PORT=3002
```

#### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all
```

#### TypeScript Errors

```bash
# Check for type errors
npm run typecheck

# Clear TypeScript cache
rm -rf frontend/node_modules/.cache backend/node_modules/.cache
```

#### Database Issues

```bash
# Reset database
rm backend/grubtech.db

# Restart backend (will recreate database)
npm run dev:backend
```

#### Hot Reload Not Working

**Frontend:**
- Check browser console for errors
- Hard refresh: Cmd/Ctrl + Shift + R
- Clear browser cache
- Restart Vite dev server

**Backend:**
- Check terminal for TypeScript errors
- Restart server manually: Ctrl+C then `npm run dev:backend`
- Check `.env` file configuration

#### CORS Errors

Ensure `backend/.env` has correct frontend URL:
```bash
FRONTEND_URL=http://localhost:5173
```

Then restart the backend server.

### Performance Tips

1. **Use specific workspace commands** when working on one side:
   - `npm run dev:frontend` (faster than `npm run dev`)
   - `npm run dev:backend` (faster than `npm run dev`)

2. **Keep tests focused**: Use `.only()` or filter patterns in watch mode

3. **Use bundle analysis** to optimize frontend performance:
   ```bash
   cd frontend && npm run build:analyze
   ```

4. **Monitor dev server performance**:
   - Vite shows HMR timing in console
   - Backend logs request timing

5. **Restart servers periodically** if they become slow after many changes

---

## 🏗️ Building for Production

### Build Commands

The monorepo provides commands to build both frontend and backend applications for production deployment.

#### Build All (Frontend + Backend)

**Build both applications in parallel:**
```bash
npm run build
```

This executes:
1. `npm run build:frontend` - Builds the frontend React application
2. `npm run build:backend` - Compiles backend TypeScript to JavaScript

#### Build Frontend Only

```bash
npm run build:frontend
```

**What this does:**
1. Installs all dependencies including devDependencies
2. Runs Vite build process
3. Compiles TypeScript, bundles assets, optimizes images
4. Minifies JavaScript and CSS
5. Generates source maps for debugging
6. Creates optimized production build in `frontend/dist/`

**Build output:**
```
frontend/dist/
├── index.html              # Entry HTML file
├── assets/
│   ├── index-[hash].js    # Bundled JavaScript (minified)
│   ├── index-[hash].css   # Bundled CSS (minified)
│   └── [images]           # Optimized images
├── manifest.json          # PWA manifest
└── sw.js                  # Service worker (if PWA enabled)
```

**Build optimizations:**
- ✅ Code splitting for faster initial load
- ✅ Tree shaking to remove unused code
- ✅ Asset compression (gzip/brotli)
- ✅ Image optimization
- ✅ CSS purging (removes unused Tailwind classes)
- ✅ Hash-based cache busting

#### Build Backend Only

```bash
npm run build:backend
```

**What this does:**
1. Installs all dependencies including devDependencies
2. Compiles TypeScript files to JavaScript using `tsc`
3. Outputs compiled files to `backend/dist/`
4. Preserves directory structure

**Build output:**
```
backend/dist/
├── server.js              # Main server entry point
├── seed.js                # Database seeding script
├── routes/                # Compiled route handlers
├── middleware/            # Compiled middleware
├── services/              # Compiled services
├── db/                    # Database initialization
├── config/                # Configuration files
└── utils/                 # Utility functions
```

**Note:** The backend build does NOT include `node_modules`. These must be installed separately in production.

#### Analyze Frontend Bundle

**Visualize bundle size and dependencies:**
```bash
cd frontend
npm run build:analyze
```

This generates an interactive HTML report showing:
- Bundle size breakdown by module
- Which dependencies are the largest
- Opportunities for code splitting
- Duplicate dependencies

**Use cases:**
- Identifying large dependencies to optimize
- Finding dead code or unused imports
- Planning code splitting strategies
- Monitoring bundle size growth over time

### Production Environment Setup

#### Frontend Production Environment

**Required environment variables:**

Create `frontend/.env.production`:
```bash
# Backend API URL - Your production backend URL
VITE_API_URL=https://your-backend-url.onrender.com

# Application Configuration
VITE_APP_NAME=Grubtech
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_LIVE_CHAT=true
```

**Important notes:**
- Frontend `.env.production` is baked into the build at compile time
- These values are PUBLIC and visible in browser
- NEVER include secrets or sensitive data
- The `VITE_` prefix is required for Vite to expose these variables

#### Backend Production Environment

**Required environment variables:**

Configure these in your hosting platform (Render, AWS, etc.):

```bash
# Server Configuration
NODE_ENV=production
PORT=10000                    # Render uses port 10000 by default

# Security - Generate secure values!
JWT_SECRET=<generate-secure-64-char-key>
JWT_EXPIRES_IN=7d

# CORS - Your frontend URL
FRONTEND_URL=https://your-frontend-url.com

# Database
DATABASE_TYPE=sqlite
DATABASE_PATH=./grubtech.db

# AWS S3 Storage (Recommended for production)
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
S3_BUCKET_NAME=<your-s3-bucket>

# Email Configuration (Optional)
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASS=<your-app-password>
EMAIL_FROM=noreply@grubtech.com
ADMIN_EMAIL=admin@grubtech.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=json              # Use 'json' for production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
ENABLE_ANALYTICS=true

# Security - MUST be false in production!
ENABLE_SETUP_ADMIN=false
```

**🔒 Security best practices:**
- Use environment variable management tools (AWS Secrets Manager, Render secrets)
- Generate cryptographically secure JWT_SECRET: `openssl rand -hex 32`
- Never commit `.env` files to version control
- Rotate secrets regularly
- Keep `ENABLE_SETUP_ADMIN=false` in production
- Use HTTPS for all production URLs

### Deployment to Render

This project is configured for deployment on [Render](https://render.com/) using Infrastructure as Code via `render.yaml`.

#### Understanding render.yaml

The `render.yaml` file defines the entire deployment configuration:

```yaml
services:
  - type: web                      # Web service (HTTP server)
    name: grubtech-backend         # Service name in Render dashboard
    runtime: node                  # Node.js runtime
    plan: starter                  # Render pricing plan
    rootDirectory: backend         # Root directory for this service
    buildCommand: npm install      # Command to run during build
    startCommand: npm start        # Command to start the service
    envVars:                       # Environment variables
      - key: NODE_ENV
        value: production          # Hardcoded value
      - key: PORT
        value: 10000              # Render's default port
      - key: JWT_SECRET
        generateValue: true        # Auto-generate secure value
        sync: false               # Don't sync across services
      - key: FRONTEND_URL
        sync: false               # Set manually in Render dashboard
      # ... more env vars
    healthCheckPath: /api/health   # Health check endpoint
    autoDeploy: true              # Auto-deploy on git push
```

**Key configuration details:**

| Field | Value | Description |
|-------|-------|-------------|
| **type** | `web` | HTTP service accessible via URL |
| **runtime** | `node` | Uses Node.js environment |
| **plan** | `starter` | Render pricing tier (free/starter/standard) |
| **rootDirectory** | `backend` | Only backend is deployed as a service |
| **buildCommand** | `npm install` | Installs dependencies during build |
| **startCommand** | `npm start` | Runs `node dist/server.js` |
| **healthCheckPath** | `/api/health` | Render pings this to verify service is running |
| **autoDeploy** | `true` | Automatically redeploys on git push |

**Environment variable options:**
- `value: production` - Hardcoded value
- `generateValue: true` - Render auto-generates secure random value
- `sync: false` - Must be set manually in Render dashboard

#### Deployment Workflow

##### Option 1: Deploy via Render Dashboard (Recommended for First Deployment)

1. **Prepare your repository:**
   ```bash
   # Ensure your code is committed and pushed
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Connect to Render:**
   - Sign up at [render.com](https://render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub/GitLab repository
   - Render will detect `render.yaml` automatically

3. **Configure environment variables:**
   - Render dashboard will show all `sync: false` variables
   - Set the following in Render dashboard:
     - `FRONTEND_URL` - Your frontend URL
     - `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` - Email credentials
     - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` - AWS S3 credentials
     - `ADMIN_EMAIL` - Admin email address
   - Render auto-generates `JWT_SECRET` (or set your own)

4. **Deploy:**
   - Click "Apply" in Render dashboard
   - Render will:
     - Pull your code from git
     - Run `npm install` (build command)
     - Start the server with `npm start`
     - Health check at `/api/health`
     - Assign a public URL: `https://grubtech-backend.onrender.com`

5. **Deploy frontend (Static Site):**

   The frontend must be deployed separately as a static site:

   - Click "New +" → "Static Site"
   - Connect the same repository
   - Configure:
     - **Build Command:** `cd frontend && npm install && npm run build`
     - **Publish Directory:** `frontend/dist`
     - **Environment Variables:**
       - `VITE_API_URL` = Your backend URL from step 4

   - Deploy and receive frontend URL

6. **Update CORS configuration:**
   - Go back to backend service in Render
   - Update `FRONTEND_URL` environment variable with your frontend URL
   - Service will auto-restart

##### Option 2: Auto-Deploy via Git Push

After initial setup, deployments are automatic:

```bash
# Make changes to your code
git add .
git commit -m "feat: add new feature"
git push origin main

# Render automatically:
# 1. Detects the push (webhook)
# 2. Pulls latest code
# 3. Runs build command
# 4. Restarts service with new code
# 5. Runs health check
```

**Deployment timeline:**
- Code push → Render webhook triggers (< 10 seconds)
- Build process (1-3 minutes)
- Service restart (< 30 seconds)
- Health check verification (< 10 seconds)
- **Total time:** 2-4 minutes typically

##### Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] **Code quality:**
  ```bash
  npm run typecheck    # No TypeScript errors
  npm run lint         # No linting errors
  npm run test:run     # All tests pass
  ```

- [ ] **Build succeeds locally:**
  ```bash
  npm run build        # Both frontend and backend build successfully
  ```

- [ ] **Environment variables configured:**
  - [ ] `JWT_SECRET` set to secure value (64+ characters)
  - [ ] `FRONTEND_URL` set to production frontend URL
  - [ ] `ENABLE_SETUP_ADMIN=false` (critical security requirement)
  - [ ] Email credentials configured (if using email features)
  - [ ] AWS S3 credentials configured (if using file uploads)

- [ ] **Database ready:**
  - [ ] Migrations applied
  - [ ] Admin user created
  - [ ] Sample data seeded (if needed)

- [ ] **Security review:**
  - [ ] No secrets in code or `.env.example`
  - [ ] CORS configured correctly
  - [ ] Rate limiting enabled
  - [ ] Helmet security headers configured

- [ ] **Documentation updated:**
  - [ ] README reflects current setup
  - [ ] Environment variables documented
  - [ ] Deployment instructions accurate

##### Post-Deployment Verification

After deployment, verify everything works:

1. **Check service health:**
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```

   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-01-09T12:00:00.000Z",
     "uptime": 123.45,
     "environment": "production"
   }
   ```

2. **Test frontend:**
   - Visit your frontend URL
   - Navigate through pages
   - Check browser console for errors
   - Test form submissions

3. **Test API endpoints:**
   ```bash
   # Test blog endpoint
   curl https://your-backend-url.onrender.com/api/blog

   # Test testimonials
   curl https://your-backend-url.onrender.com/api/testimonials
   ```

4. **Verify admin login:**
   - Visit `/admin` route
   - Login with admin credentials
   - Verify dashboard loads

5. **Check logs:**
   - View logs in Render dashboard
   - Look for errors or warnings
   - Verify no security issues

6. **Monitor performance:**
   - Check response times
   - Monitor memory usage
   - Watch for errors in Sentry (if configured)

##### Troubleshooting Deployment Issues

**Build fails:**
- Check Render build logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version matches `engines` field
- Try building locally first

**Service won't start:**
- Check Render runtime logs
- Verify `PORT` environment variable is set
- Ensure database file is writable
- Check for missing environment variables

**Health check fails:**
- Verify `/api/health` endpoint exists and returns 200
- Check server is binding to correct port (`process.env.PORT`)
- Look for startup errors in logs

**CORS errors:**
- Verify `FRONTEND_URL` matches your actual frontend URL
- Check it includes protocol (https://)
- Ensure no trailing slash

**Environment variables not working:**
- Check variable names match exactly (case-sensitive)
- Verify they're set in Render dashboard
- Restart service after changing variables

##### Rolling Back a Deployment

If a deployment introduces issues:

1. **Via Render Dashboard:**
   - Go to service → Deploys tab
   - Find the last working deployment
   - Click "Redeploy" on that version

2. **Via Git:**
   ```bash
   # Revert the problematic commit
   git revert <commit-hash>
   git push origin main

   # Or reset to last working version (be careful!)
   git reset --hard <last-working-commit>
   git push --force origin main
   ```

3. **Quick hotfix:**
   - Create a hotfix branch
   - Fix the issue
   - Push to trigger new deployment
   ```bash
   git checkout -b hotfix/critical-bug
   # Fix the bug
   git commit -m "hotfix: fix critical bug"
   git push origin hotfix/critical-bug
   # Merge to main
   ```

### Alternative Deployment Platforms

While this project is optimized for Render, it can be deployed to other platforms:

#### Deploying to Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

Configure environment variables in Vercel dashboard.

#### Deploying to Heroku

Create `Procfile` in root:
```
web: cd backend && npm start
```

Deploy:
```bash
heroku create grubtech-app
git push heroku main
heroku config:set JWT_SECRET=your-secret
```

#### Deploying to AWS (Advanced)

- **Frontend:** Deploy to S3 + CloudFront
- **Backend:** Deploy to Elastic Beanstalk or ECS
- **Database:** RDS for production database

#### Deploying with Docker

Create `Dockerfile` (not included by default):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Performance Optimization for Production

**Frontend optimizations:**
- ✅ Lazy loading routes with React.lazy()
- ✅ Image optimization with Vite plugins
- ✅ Code splitting by route
- ✅ PWA caching strategies
- ✅ CDN for static assets

**Backend optimizations:**
- ✅ Compression middleware (gzip)
- ✅ Rate limiting to prevent abuse
- ✅ Database indexing
- ✅ Caching headers for static files
- ✅ Connection pooling (if using PostgreSQL)

**Monitoring recommendations:**
- Use Sentry for error tracking
- Monitor Web Vitals for frontend performance
- Set up Render metrics for backend monitoring
- Configure alerts for critical errors

---

## 🔐 Environment Variables Reference

This section provides a comprehensive reference for all environment variables used in the Grubtech Website project. For setup instructions, see the [Environment Setup](#environment-setup) section above.

### Quick Links

- **Backend .env.example**: [`backend/.env.example`](./backend/.env.example) - Complete backend configuration template
- **Frontend .env.production.example**: [`frontend/.env.production.example`](./frontend/.env.production.example) - Frontend production configuration template

### Backend Environment Variables

All backend environment variables are configured in `backend/.env`.

#### Server Configuration

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `NODE_ENV` | ✅ Yes | - | Environment mode | `development`, `production` |
| `PORT` | ✅ Yes | `3001` | Port for Express server | `3001`, `10000` (Render) |

#### Security & Authentication

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `JWT_SECRET` | ✅ Yes | - | Secret key for JWT token signing (64+ chars) | Generate: `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | ❌ No | `7d` | JWT token expiration time | `7d`, `30d`, `24h` |

**Security Note:** Always use a cryptographically secure random string for `JWT_SECRET` in production. Never use the default example value.

#### CORS Configuration

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `FRONTEND_URL` | ✅ Yes | - | Frontend URL for CORS (no trailing slash) | `http://localhost:5173`, `https://grubtech.com` |
| `ALLOWED_ORIGINS` | ❌ No | - | Additional allowed origins (comma-separated) | `https://staging.grubtech.com,https://preview.grubtech.com` |

#### Database Configuration

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `DATABASE_TYPE` | ✅ Yes | `sqlite` | Database type | `sqlite`, `postgres` |
| `DATABASE_PATH` | ✅ Yes (SQLite) | `./grubtech.db` | Path to SQLite database file | `./grubtech.db`, `/data/grubtech.db` |
| `DATABASE_URL` | ✅ Yes (PostgreSQL) | - | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `DATABASE_POOL_MIN` | ❌ No | `2` | Minimum connection pool size (PostgreSQL) | `2` |
| `DATABASE_POOL_MAX` | ❌ No | `10` | Maximum connection pool size (PostgreSQL) | `10`, `20` |

#### File Storage Configuration

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `STORAGE_TYPE` | ✅ Yes | `local` | Storage backend type | `local`, `s3` |
| `AWS_REGION` | ✅ Yes (S3) | - | AWS region for S3 bucket | `us-east-1`, `eu-west-1` |
| `AWS_ACCESS_KEY_ID` | ✅ Yes (S3) | - | AWS access key ID | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | ✅ Yes (S3) | - | AWS secret access key | Your AWS secret key |
| `S3_BUCKET_NAME` | ✅ Yes (S3) | - | S3 bucket name for file uploads | `grubtech-uploads` |
| `CLOUDFRONT_URL` | ❌ No | - | CloudFront CDN URL for serving files | `https://d123456789.cloudfront.net` |

**Storage Notes:**
- Use `local` storage for development (files stored in `backend/uploads/`)
- Use `s3` storage for production (requires AWS credentials)
- CloudFront CDN is optional but recommended for production

#### Email Configuration (Optional)

All email variables are optional. If not configured, the application will still work but won't send email notifications.

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `EMAIL_ENABLED` | ❌ No | `false` | Enable/disable email functionality | `true`, `false` |
| `EMAIL_HOST` | ❌ No (Required if enabled) | - | SMTP server hostname | `smtp.gmail.com`, `smtp.sendgrid.net` |
| `EMAIL_PORT` | ❌ No (Required if enabled) | `587` | SMTP server port | `587` (TLS), `465` (SSL) |
| `EMAIL_USER` | ❌ No (Required if enabled) | - | SMTP username/email | `your-email@example.com` |
| `EMAIL_PASS` | ❌ No (Required if enabled) | - | SMTP password/app password | Your SMTP password |
| `EMAIL_FROM` | ❌ No | `noreply@grubtech.com` | Sender email address | `noreply@grubtech.com` |
| `ADMIN_EMAIL` | ❌ No | - | Admin email for notifications | `admin@grubtech.com` |

**Email Provider Examples:**
- **Gmail**: Use `smtp.gmail.com` with [App Password](https://support.google.com/accounts/answer/185833)
- **SendGrid**: Use `smtp.sendgrid.net` with API key as password
- **AWS SES**: Use your SES SMTP endpoint
- **Office 365**: Use `smtp.office365.com`

#### Logging Configuration

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `LOG_LEVEL` | ❌ No | `info` | Winston log level | `error`, `warn`, `info`, `http`, `debug` |
| `LOG_FORMAT` | ❌ No | `pretty` | Log output format | `pretty` (dev), `json` (production) |

**Log Levels:**
- `error`: Only errors
- `warn`: Warnings and errors
- `info`: Info, warnings, and errors (recommended)
- `http`: HTTP requests + above
- `debug`: All logs including debug info

#### Rate Limiting

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `RATE_LIMIT_WINDOW_MS` | ❌ No | `900000` | Rate limit time window in milliseconds | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ No | `1000` | Max requests per window per IP | `100`, `1000` |

**Rate Limiting Examples:**
- **Development**: `1000` requests per 15 minutes
- **Production**: `100` requests per 15 minutes (stricter)
- **API-heavy apps**: Consider using Redis-based rate limiting

#### Feature Flags

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `ENABLE_ANALYTICS` | ❌ No | `true` | Enable analytics endpoints | `true`, `false` |

#### Setup Admin Feature (⚠️ Security Critical)

**WARNING:** These variables are for **INITIAL SETUP ONLY**. Must be disabled in production after first admin is created.

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `ENABLE_SETUP_ADMIN` | ❌ No | `false` | Enable setup admin endpoint | `false` (MUST be false in production) |
| `SETUP_SECRET_TOKEN` | ❌ No (Required if enabled) | - | Secret token for setup endpoint | Generate: `openssl rand -hex 64` |
| `ADMIN_USERNAME` | ❌ No | - | Admin email for setup endpoint | `admin@grubtech.com` |
| `ADMIN_PASSWORD` | ❌ No | - | Admin password for setup endpoint | Strong password (12+ chars) |

**🔒 Security Requirements:**
- ❌ **MUST** be `false` in production after initial setup
- ✅ Only enable for initial deployment to create first admin
- ✅ Disable within minutes after admin creation
- ✅ Use 64+ character tokens
- ✅ Never commit tokens to version control
- ✅ See extensive security documentation in `backend/.env.example`

#### Backend Environment Variable Summary

**Minimum Required for Development:**
```bash
NODE_ENV=development
PORT=3001
JWT_SECRET=<generate-secure-key>
FRONTEND_URL=http://localhost:5173
DATABASE_TYPE=sqlite
DATABASE_PATH=./grubtech.db
```

**Minimum Required for Production:**
```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=<generate-secure-key>
FRONTEND_URL=https://your-frontend-url.com
DATABASE_TYPE=sqlite
DATABASE_PATH=./grubtech.db
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
S3_BUCKET_NAME=<your-bucket>
ENABLE_SETUP_ADMIN=false
```

---

### Frontend Environment Variables

The frontend uses Vite, which requires environment variables to be prefixed with `VITE_` to be exposed to the client-side code.

#### Development Environment

**No `.env` file required for local development.** The frontend automatically uses `http://localhost:3001` as the API URL in development mode.

#### Production Environment

All frontend production variables are configured in `frontend/.env.production`.

| Variable | Required | Default | Description | Example |
|----------|----------|---------|-------------|---------|
| `VITE_API_URL` | ✅ Yes | - | Backend API URL (no trailing slash) | `https://api.grubtech.com`, `https://grubtech-backend.onrender.com` |
| `VITE_APP_NAME` | ❌ No | `Grubtech` | Application name | `Grubtech` |
| `VITE_ENABLE_ANALYTICS` | ❌ No | `false` | Enable analytics tracking | `true`, `false` |
| `VITE_ENABLE_LIVE_CHAT` | ❌ No | `false` | Enable live chat widget | `true`, `false` |

#### Frontend Environment Variable Details

**`VITE_API_URL` (Required)**
- Must include protocol (`https://`)
- Must NOT include trailing slash
- Should point to your backend API root
- Example: `https://api.grubtech.com`

**`VITE_APP_NAME` (Optional)**
- Used in page titles, meta tags, and PWA manifest
- Default: `Grubtech`

**`VITE_ENABLE_ANALYTICS` (Optional)**
- Enables Sentry error tracking and Web Vitals monitoring
- Should be `true` in production for monitoring
- Can be `false` in staging/preview environments

**`VITE_ENABLE_LIVE_CHAT` (Optional)**
- Enables live chat widget (if implemented)
- Useful for customer support on marketing pages

#### Frontend Environment Variable Summary

**Development (.env.local - Optional):**
```bash
# Not required - defaults to http://localhost:3001
# Only needed if backend runs on different port
VITE_API_URL=http://localhost:3001
```

**Production (.env.production - Required):**
```bash
VITE_API_URL=https://your-backend-url.onrender.com
VITE_APP_NAME=Grubtech
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_LIVE_CHAT=true
```

#### Important Frontend Notes

**⚠️ Security Warning:**
- All `VITE_*` variables are **PUBLIC** and visible in browser
- **NEVER** include secrets, API keys, or sensitive data
- Anyone can view these in browser DevTools or page source
- Use backend for sensitive operations

**Build Time vs Runtime:**
- Frontend environment variables are **baked into the build** at compile time
- Changing `.env.production` requires rebuilding: `npm run build`
- Not like backend variables which can change without rebuild

**Environment Files Priority:**
```
.env.production.local   # Local overrides (highest priority, git-ignored)
.env.production         # Production config
.env.local              # Local overrides for all modes (git-ignored)
.env                    # Base config
```

---

### Generating Secure Secrets

Use these commands to generate cryptographically secure secrets:

#### JWT Secret (Backend)

**Using OpenSSL:**
```bash
openssl rand -hex 32
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Output:** 64-character hexadecimal string (32 bytes)

#### Setup Secret Token (Backend)

**Using OpenSSL:**
```bash
openssl rand -hex 64
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Output:** 128-character hexadecimal string (64 bytes)

---

### Environment Variable Best Practices

#### Development
- ✅ Use `.env.example` files as templates
- ✅ Copy to `.env` and fill in values
- ✅ Keep defaults for local development
- ✅ Use `local` storage and `sqlite` database
- ❌ Never commit `.env` files

#### Production
- ✅ Use environment variable management tools (Render secrets, AWS Secrets Manager)
- ✅ Generate cryptographically secure secrets
- ✅ Use `s3` storage for file uploads
- ✅ Set `NODE_ENV=production`
- ✅ Set `LOG_FORMAT=json` for structured logging
- ✅ Keep `ENABLE_SETUP_ADMIN=false`
- ✅ Use HTTPS for all URLs
- ✅ Rotate secrets regularly
- ❌ Never log environment variables
- ❌ Never expose secrets in error messages

#### Security
- 🔒 Store secrets in secure vaults (AWS Secrets Manager, HashiCorp Vault)
- 🔒 Use IAM roles instead of access keys when possible (AWS)
- 🔒 Rotate JWT secrets periodically
- 🔒 Use different secrets for each environment
- 🔒 Monitor access to environment variables
- 🔒 Audit who can view/edit secrets
- 🔒 Use encrypted connections for database and storage

#### CI/CD
- ✅ Set environment variables in CI/CD platform (GitHub Actions, GitLab CI)
- ✅ Use secret management features
- ✅ Validate required variables in build scripts
- ✅ Fail builds if critical variables are missing
- ❌ Never echo secrets in CI logs

---

### Troubleshooting Environment Variables

#### Backend Variables Not Working

**Problem:** Environment variable changes not reflected

**Solution:**
```bash
# 1. Verify .env file exists
ls -la backend/.env

# 2. Check for syntax errors (no spaces around =)
cat backend/.env

# 3. Restart the backend server
npm run dev:backend
```

#### Frontend Variables Not Working

**Problem:** `VITE_*` variables are undefined in browser

**Solution:**
```bash
# 1. Verify variable has VITE_ prefix
# ❌ API_URL=https://example.com
# ✅ VITE_API_URL=https://example.com

# 2. Rebuild the frontend (variables are baked in at build time)
cd frontend
npm run build

# 3. Restart dev server
npm run dev
```

#### CORS Errors

**Problem:** CORS errors in browser console

**Solution:**
```bash
# 1. Check FRONTEND_URL matches exactly (no trailing slash)
# backend/.env
FRONTEND_URL=http://localhost:5173

# 2. Check protocol matches (http vs https)
# 3. Restart backend server
npm run dev:backend
```

#### AWS S3 Upload Fails

**Problem:** File uploads fail with S3 errors

**Solution:**
```bash
# 1. Verify AWS credentials are set
# backend/.env
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
S3_BUCKET_NAME=<your-bucket>

# 2. Check S3 bucket permissions (must allow PutObject)
# 3. Verify IAM user has s3:PutObject permission
# 4. Check bucket name is correct (no typos)
```

#### Email Not Sending

**Problem:** Email notifications not being sent

**Solution:**
```bash
# 1. Verify EMAIL_ENABLED=true
# backend/.env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=<app-password>

# 2. For Gmail, use App Password (not regular password)
# 3. Check SMTP credentials are correct
# 4. Check firewall allows outbound SMTP connections
# 5. Look for errors in backend logs
```

#### Database Errors

**Problem:** Database connection or query errors

**Solution:**
```bash
# 1. Check database configuration
# backend/.env
DATABASE_TYPE=sqlite
DATABASE_PATH=./grubtech.db

# 2. Ensure database file is writable
chmod 644 backend/grubtech.db

# 3. Reset database if corrupted
rm backend/grubtech.db
npm run dev:backend  # Will recreate
```

#### Missing Environment Variables in Production

**Problem:** Application crashes with "Missing required environment variable" error

**Solution:**
1. Check hosting platform environment variables (Render dashboard, AWS console)
2. Ensure all required variables are set
3. Check for typos in variable names (case-sensitive)
4. Verify variables are in correct service (backend vs frontend)
5. Restart service after adding variables

---

## 📚 Additional Documentation

This repository contains additional documentation for specific features and systems:

### Design System

The frontend follows a comprehensive design system documented in:

📄 **[Design System Documentation](./frontend/src/lib/DESIGN_SYSTEM.md)**

**Contents:**
- Color palette and theme tokens
- Typography scale and font families
- Spacing and layout system
- Component design patterns
- Accessibility guidelines
- Animation and motion principles
- Responsive breakpoints
- Design tokens and CSS custom properties

**Use cases:**
- Understanding the visual design language
- Creating new UI components
- Maintaining design consistency
- Implementing responsive layouts
- Following accessibility standards

### Analytics

The frontend includes analytics tracking with detailed documentation:

📄 **[Analytics README](./frontend/src/utils/analytics/README.md)**

**Contents:**
- Analytics architecture and implementation
- Event tracking setup
- Custom event definitions
- Sentry error tracking configuration
- Web Vitals performance monitoring
- Privacy considerations
- Analytics best practices

**Use cases:**
- Adding new analytics events
- Understanding tracked metrics
- Debugging analytics issues
- Implementing performance monitoring
- Configuring error tracking

### Security Verification

The backend includes a comprehensive security verification report:

📄 **[Security Verification Report](./backend/SECURITY_VERIFICATION_REPORT.md)**

**Contents:**
- Security audit results
- Vulnerability assessments
- Security best practices implemented
- Authentication and authorization details
- Input validation and sanitization
- CORS and rate limiting configuration
- Security middleware documentation

**Use cases:**
- Understanding security measures
- Security compliance reviews
- Identifying potential vulnerabilities
- Planning security updates
- Onboarding security-conscious developers

### Environment Configuration

Comprehensive environment variable documentation with examples:

📄 **[Backend Environment Variables](./backend/.env.example)**

**Contents:**
- All backend environment variables with descriptions
- Required vs optional configuration
- Security warnings and best practices
- Provider-specific examples (AWS, Gmail, SendGrid)
- Setup admin feature documentation

**Use cases:**
- Initial project setup
- Production deployment configuration
- Troubleshooting environment issues
- Understanding configuration options

---

## 🤝 Contributing

### Contribution Guidelines

This is a **proprietary project** maintained by the Grubtech team. Contributions are currently **restricted to authorized team members only**.

#### For Team Members

**Before contributing, please:**

1. **Familiarize yourself with the codebase:**
   - Read this README thoroughly
   - Review the [Design System](./frontend/src/lib/DESIGN_SYSTEM.md)
   - Understand the project structure
   - Check existing patterns in the code

2. **Set up your development environment:**
   - Follow the [Installation](#-prerequisites-and-installation) instructions
   - Ensure all prerequisites are installed
   - Configure environment variables correctly
   - Verify your setup by running tests

3. **Follow code quality standards:**
   - Run `npm run typecheck` before committing
   - Run `npm run lint` to check code style
   - Ensure all tests pass with `npm test`
   - Write tests for new features
   - Follow existing code patterns and conventions

4. **Commit message conventions:**
   ```bash
   # Format: <type>: <description>

   # Types:
   feat: Add new feature
   fix: Bug fix
   docs: Documentation changes
   style: Code style changes (formatting, semicolons, etc.)
   refactor: Code refactoring without behavior changes
   test: Adding or updating tests
   chore: Build process, dependency updates, etc.

   # Examples:
   git commit -m "feat: add multi-language support for blog posts"
   git commit -m "fix: resolve CORS error on contact form submission"
   git commit -m "docs: update deployment instructions"
   git commit -m "refactor: simplify authentication middleware"
   ```

5. **Branch naming conventions:**
   ```bash
   # Format: <type>/<short-description>

   # Examples:
   feature/add-blog-pagination
   fix/contact-form-validation
   refactor/optimize-image-loading
   docs/update-readme
   ```

6. **Pull request process:**
   - Create a feature branch from `main`
   - Make your changes following the guidelines above
   - Write clear commit messages
   - Push your branch and create a pull request
   - Fill out the PR template with:
     - Description of changes
     - Related issue numbers
     - Testing performed
     - Screenshots (for UI changes)
   - Request review from at least one team member
   - Address review feedback promptly
   - Squash commits before merging (if needed)

#### Development Workflow

**1. Create a new branch:**
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

**2. Make your changes:**
```bash
# Make code changes
# Run tests continuously
npm test

# Check types and lint
npm run typecheck
npm run lint
```

**3. Commit your changes:**
```bash
git add .
git commit -m "feat: add your feature description"
```

**4. Push and create PR:**
```bash
git push origin feature/your-feature-name
# Create pull request on GitHub/GitLab
```

**5. After PR approval:**
```bash
# Merge via GitHub/GitLab UI
# Delete your branch after merge
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

#### Code Review Checklist

When reviewing pull requests, check for:

- [ ] **Functionality**: Does the code work as intended?
- [ ] **Tests**: Are there tests for new functionality?
- [ ] **Type Safety**: Does `npm run typecheck` pass?
- [ ] **Code Style**: Does `npm run lint` pass?
- [ ] **Performance**: Are there any performance concerns?
- [ ] **Security**: Are there any security vulnerabilities?
- [ ] **Documentation**: Are code comments clear and helpful?
- [ ] **Design System**: Does UI follow the design system?
- [ ] **Accessibility**: Are accessibility standards followed?
- [ ] **Responsiveness**: Does UI work on all screen sizes?
- [ ] **Browser Compatibility**: Tested in major browsers?
- [ ] **Error Handling**: Are errors handled gracefully?

#### Testing Requirements

All contributions must include appropriate tests:

**Frontend:**
- Component tests for new UI components
- Integration tests for user flows
- Accessibility tests (using Testing Library)
- Visual regression tests (if applicable)

**Backend:**
- Unit tests for business logic
- Integration tests for API endpoints
- Security tests for authentication/authorization
- Database migration tests

**Run tests before committing:**
```bash
# Frontend tests
cd frontend && npm run test:run

# Backend tests
cd backend && npm run test:run

# Coverage report
npm run test:coverage
```

#### Getting Help

**Questions or issues?**

- Check this README and additional documentation first
- Search existing issues on the project repository
- Ask in the team's communication channel (Slack, Teams, etc.)
- Contact the project maintainers

**Project Maintainers:**
- Technical Lead: [Contact via team channel]
- Backend Lead: [Contact via team channel]
- Frontend Lead: [Contact via team channel]

---

## 📄 License

**Copyright © 2024 Grubtech. All rights reserved.**

This is proprietary software. The source code is confidential and may not be copied, distributed, or modified without explicit written permission from Grubtech.

### License Details

- **License Type**: Proprietary/UNLICENSED
- **Usage**: Internal use only
- **Distribution**: Not permitted without authorization
- **Modifications**: Restricted to authorized team members only

### Third-Party Licenses

This project uses various open-source packages listed in `package.json` files. Each package is subject to its own license terms. See individual package documentation for details:

- Frontend dependencies: `frontend/package.json`
- Backend dependencies: `backend/package.json`

**Note:** While this project uses open-source dependencies, the project itself remains proprietary.

---

