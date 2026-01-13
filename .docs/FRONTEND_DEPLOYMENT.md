# Frontend Deployment Guide - Cloudflare Pages

This guide will walk you through deploying your frontend to Cloudflare Pages.

## What is Cloudflare Pages?

Cloudflare Pages is a hosting platform for static websites (like your React frontend). It's similar to Vercel or Netlify, but integrated with Cloudflare's global network.

## Current Status

✅ **Backend API**: Already deployed at `https://grubtech-api.shady-ehab.workers.dev`
- All endpoints working
- Database connected
- Authentication working

🔄 **Frontend**: Needs to be deployed to Cloudflare Pages

---

## Step 1: Create a Cloudflare Pages Project

### Option A: Via Cloudflare Dashboard (Recommended for first time)

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Click "Workers & Pages" in the left sidebar
   - Click "Create application"
   - Click the "Pages" tab
   - Click "Connect to Git"

2. **Connect GitHub Repository**
   - Select "Main Grubtech Website" repository
   - Click "Begin setup"

3. **Configure Build Settings**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: frontend/dist
   Root directory: frontend
   ```

4. **Add Environment Variables**

   Click "Environment variables (advanced)" and add:

   | Variable Name | Value |
   |--------------|-------|
   | `VITE_API_URL` | `https://grubtech-api.shady-ehab.workers.dev` |
   | `VITE_APP_NAME` | `Grubtech` |
   | `VITE_ENABLE_ANALYTICS` | `true` |
   | `VITE_ENABLE_LIVE_CHAT` | `false` |

5. **Deploy**
   - Click "Save and Deploy"
   - Cloudflare will build and deploy your frontend
   - Wait 2-3 minutes for the first deployment

6. **Get Your URL**
   - After deployment, you'll see a URL like: `https://grubtech-website.pages.dev`
   - Your frontend is now live!

---

## Step 2: Update Backend CORS Settings

Your backend needs to allow requests from your new frontend URL.

1. **Open `workers/wrangler.toml`**

2. **Update the `ALLOWED_ORIGINS` in the production section:**
   ```toml
   [vars]
   ENVIRONMENT = "production"
   ALLOWED_ORIGINS = "https://grubtech.com,https://www.grubtech.com,https://grubtech-website.pages.dev"
   ```
   *(Replace `grubtech-website.pages.dev` with your actual Pages URL)*

3. **Redeploy the worker:**
   ```bash
   cd workers
   wrangler deploy --env=""
   ```

---

## Step 3: Test Your Deployment

1. **Visit your Pages URL** (e.g., `https://grubtech-website.pages.dev`)

2. **Test the following:**
   - ✅ Homepage loads
   - ✅ Navigation works
   - ✅ Contact form appears (won't send emails yet - that's optional)
   - ✅ Try logging in to the admin panel with:
     - Username: `admin`
     - Password: `AdminPass123`

---

## Option B: Deploy via Command Line (Alternative)

If you prefer using the terminal:

1. **Build the frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to Pages:**
   ```bash
   wrangler pages deploy dist --project-name=grubtech-website
   ```

3. **Set environment variables:**
   ```bash
   wrangler pages project create grubtech-website
   wrangler pages deployment create dist --project-name=grubtech-website
   ```

---

## Understanding the Architecture

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  USER'S BROWSER                                     │
│                                                     │
└────────────┬────────────────────────────────────────┘
             │
             ├──────────────┬─────────────────────┐
             │              │                     │
             v              v                     v
   ┌─────────────┐  ┌──────────────┐   ┌─────────────────┐
   │  Cloudflare │  │  Cloudflare  │   │   Cloudflare    │
   │    Pages    │  │   Workers    │   │   Resources     │
   │             │  │              │   │                 │
   │  (Frontend) │──│    (API)     │───│  • D1 Database  │
   │             │  │              │   │  • KV Storage   │
   │   React     │  │    Hono      │   │  • R2 Storage   │
   │   TypeScript│  │  TypeScript  │   │                 │
   └─────────────┘  └──────────────┘   └─────────────────┘
```

### How it works:

1. **Frontend (Cloudflare Pages)**:
   - Hosts your React application
   - Static files (HTML, CSS, JavaScript)
   - Runs in the user's browser
   - URL: `https://grubtech-website.pages.dev`

2. **Backend (Cloudflare Workers)**:
   - Hosts your API
   - Handles authentication, database queries, file uploads
   - Runs on Cloudflare's edge network
   - URL: `https://grubtech-api.shady-ehab.workers.dev`

3. **Resources (D1, KV, R2)**:
   - Database, cache, file storage
   - Connected to Workers

---

## Automatic Deployments

Once you set up Cloudflare Pages with GitHub:

- **Every push to `main` branch** → Automatically deploys to production
- **Every pull request** → Creates a preview deployment
- **No manual commands needed** after initial setup!

---

## Custom Domain Setup (Optional)

If you want to use `grubtech.com` instead of `.pages.dev`:

1. **Add domain to Cloudflare**:
   - Go to Cloudflare Dashboard
   - Add your domain (grubtech.com)
   - Update nameservers at your domain registrar

2. **Connect to Pages**:
   - Go to your Pages project
   - Click "Custom domains"
   - Add `grubtech.com` and `www.grubtech.com`

3. **Update backend CORS**:
   - Update `ALLOWED_ORIGINS` in `workers/wrangler.toml`
   - Redeploy worker

4. **Update Workers domain**:
   - Go to your Worker in dashboard
   - Click "Settings" → "Triggers"
   - Add custom domain: `api.grubtech.com`

Final URLs:
- Frontend: `https://grubtech.com`
- Backend: `https://api.grubtech.com`

---

## Troubleshooting

### Build Fails

**Error**: `npm install failed`
- Check that `frontend/package.json` exists
- Verify Node version in build settings (should be 20.x)

**Error**: `VITE_API_URL is not defined`
- Add environment variable in Pages dashboard
- Go to Settings → Environment variables

### API Calls Fail

**Error**: CORS error in browser console
- Update `ALLOWED_ORIGINS` in `workers/wrangler.toml`
- Redeploy worker

**Error**: 404 on API calls
- Check `VITE_API_URL` is set correctly
- Verify worker is deployed: `curl https://grubtech-api.shady-ehab.workers.dev/api/health`

### Frontend Shows Blank Page

- Check browser console for errors
- Verify build completed successfully
- Try hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

---

## What You Should Do Next

1. ✅ **Deploy Frontend** - Follow Step 1 above
2. ✅ **Update CORS** - Follow Step 2 above
3. ✅ **Test Everything** - Follow Step 3 above
4. ⏭️ **Set up Email** (Optional) - Add EMAIL_API_KEY secret when ready
5. ⏭️ **Custom Domain** (Optional) - When you're ready to use grubtech.com

---

## Summary of What's Already Done

✅ Backend API deployed and working
✅ Database set up and migrated
✅ Admin user created
✅ Authentication working
✅ All secrets configured
✅ Code pushed to GitHub main branch

🔄 **Still needed**: Frontend deployment (takes 5 minutes following this guide)

---

## Questions?

- **Where is my data stored?** → Cloudflare D1 (SQLite database in WEUR region)
- **How much does this cost?** → Free tier covers most usage (10GB/month, 1 million requests)
- **Can I use a different frontend?** → Yes, just point VITE_API_URL to your Worker URL
- **How do I make changes?** → Push to GitHub, Pages auto-deploys

Let me know if you need help with any step!
