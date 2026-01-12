# Cloudflare Deployment Setup Guide

This guide will help you set up your Cloudflare account and configure GitHub Actions for automated deployments.

## Prerequisites

- Cloudflare account (free tier works)
- GitHub repository access
- Node.js 20.x installed locally

---

## Step 1: Set Up Cloudflare Account

### 1.1 Create Cloudflare Account
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up for a free account if you don't have one

### 1.2 Get Your Account ID
1. Log in to Cloudflare Dashboard
2. Click on "Workers & Pages" in the left sidebar
3. Your Account ID is shown on the right side of the page
4. Copy this - you'll need it for GitHub secrets

### 1.3 Create API Token
1. Go to "My Profile" → "API Tokens"
2. Click "Create Token"
3. Use the "Edit Cloudflare Workers" template
4. Configure permissions:
   - Account → Cloudflare Pages → Edit
   - Account → Cloudflare Workers Scripts → Edit
   - Account → D1 → Edit
   - Account → R2 → Edit
   - Zone → Workers Routes → Edit (if using custom domain)
5. Click "Continue to summary" → "Create Token"
6. **IMPORTANT**: Copy the token immediately - you won't see it again!

---

## Step 2: Create Cloudflare Resources

### 2.1 Install Wrangler CLI
```bash
npm install -g wrangler@latest
wrangler login
```

### 2.2 Create D1 Databases

**Production Database:**
```bash
cd workers
wrangler d1 create grubtech-production
```

Copy the `database_id` from the output and update `workers/wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "grubtech-production"
database_id = "YOUR_PRODUCTION_DATABASE_ID"  # Paste here
```

**Staging Database:**
```bash
wrangler d1 create grubtech-staging
```

Copy the `database_id` and update `workers/wrangler.toml`:
```toml
[[env.staging.d1_databases]]
binding = "DB"
database_name = "grubtech-staging"
database_id = "YOUR_STAGING_DATABASE_ID"  # Paste here
```

**Development Database:**
```bash
wrangler d1 create grubtech-development
```

Update the development section in `wrangler.toml`.

### 2.3 Create KV Namespaces

**Production:**
```bash
wrangler kv:namespace create CACHE
```
Copy the `id` and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_PRODUCTION_KV_ID"
```

**Staging:**
```bash
wrangler kv:namespace create CACHE --env staging
```
Update the staging section.

### 2.4 Create R2 Buckets

**Production:**
```bash
wrangler r2 bucket create grubtech-uploads
```

**Staging:**
```bash
wrangler r2 bucket create grubtech-uploads-staging
```

**Development:**
```bash
wrangler r2 bucket create grubtech-uploads-dev
```

### 2.5 Run Database Migrations

**Production:**
```bash
cd workers
wrangler d1 execute grubtech-production --file=./migrations/0001_initial_schema.sql
wrangler d1 execute grubtech-production --file=./migrations/0002_indexes.sql
```

**Staging:**
```bash
wrangler d1 execute grubtech-staging --file=./migrations/0001_initial_schema.sql --env staging
wrangler d1 execute grubtech-staging --file=./migrations/0002_indexes.sql --env staging
```

---

## Step 3: Set Up Secrets

### 3.1 Generate Secrets Locally

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.2 Set Production Secrets
```bash
cd workers

# JWT secret for authentication
wrangler secret put JWT_SECRET
# Paste the generated secret when prompted

# Admin password (choose a strong password)
wrangler secret put ADMIN_PASSWORD

# Email configuration (optional - for contact forms)
wrangler secret put EMAIL_API_KEY
wrangler secret put ADMIN_EMAIL

# Sentry DSN (optional - for error tracking)
wrangler secret put SENTRY_DSN
```

### 3.3 Set Staging Secrets
```bash
# Same as above, but add --env staging to each command
wrangler secret put JWT_SECRET --env staging
wrangler secret put ADMIN_PASSWORD --env staging
# ... etc
```

---

## Step 4: Configure GitHub Secrets

### 4.1 Add Repository Secrets
1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Account ID from Step 1.2 | Cloudflare Account ID |
| `CLOUDFLARE_API_TOKEN` | Your API Token from Step 1.3 | API token with Workers permissions |

---

## Step 5: Update wrangler.toml

After creating all resources, your `workers/wrangler.toml` should have all IDs filled in:

```toml
[[d1_databases]]
binding = "DB"
database_name = "grubtech-production"
database_id = "abc123..."  # ✅ Filled

[[kv_namespaces]]
binding = "CACHE"
id = "xyz789..."  # ✅ Filled
```

Commit and push the updated `wrangler.toml`:
```bash
git add workers/wrangler.toml
git commit -m "chore: configure Cloudflare resource IDs"
git push origin main
```

---

## Step 6: Create Cloudflare Pages Project

### 6.1 Create Pages Project via Dashboard
1. Go to Cloudflare Dashboard → "Workers & Pages"
2. Click "Create application" → "Pages" tab
3. Connect your GitHub repository
4. Configure build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `frontend`

### 6.2 Configure Environment Variables (Pages)
In the Pages project settings, add:
- `VITE_API_URL`: `https://grubtech-api.workers.dev` (or your custom domain)

---

## Step 7: Deploy

### 7.1 Test Local Deployment
```bash
# Test workers locally
cd workers
npm run dev

# Test frontend locally
cd ../frontend
npm run dev
```

### 7.2 Manual Deployment (First Time)
```bash
# Deploy workers
cd workers
npm run deploy

# Deploy frontend
cd ../frontend
npm run build
npx wrangler pages deploy dist --project-name=grubtech-website
```

### 7.3 Automated Deployment
Once GitHub secrets are configured, deployments happen automatically:
- **Push to `main`** → Deploys to production
- **Push to `develop`** → Deploys to staging
- **Pull requests** → Run tests only

---

## Step 8: Verify Deployment

### 8.1 Check Workers Deployment
Visit: `https://grubtech-api.workers.dev/api/health`

You should see a health check response.

### 8.2 Check Pages Deployment
Visit your Cloudflare Pages URL (shown in the dashboard).

---

## Troubleshooting

### Issue: "Missing entry-point to Worker script"
**Solution**: Make sure you're in the `workers/` directory when running wrangler commands, or specify the config file:
```bash
wrangler deploy --config workers/wrangler.toml
```

### Issue: "Database not found"
**Solution**: Make sure you've created the D1 database and updated the `database_id` in `wrangler.toml`.

### Issue: "Unauthorized"
**Solution**: Run `wrangler login` or check that your `CLOUDFLARE_API_TOKEN` is correct.

### Issue: GitHub Actions failing
**Solution**: Check that you've added both `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` to GitHub repository secrets.

---

## Custom Domain Setup (Optional)

### For Workers (API)
1. Go to Workers & Pages → your worker
2. Click "Settings" → "Triggers" → "Custom Domains"
3. Add your domain (e.g., `api.grubtech.com`)

### For Pages (Frontend)
1. Go to Workers & Pages → your Pages project
2. Click "Custom domains"
3. Add your domain (e.g., `grubtech.com`)

---

## Monitoring & Logs

### View Logs
```bash
# Tail production logs
wrangler tail grubtech-api

# Tail staging logs
wrangler tail grubtech-api-staging
```

### Analytics
1. Go to Cloudflare Dashboard
2. Click on your Worker or Pages project
3. View analytics, logs, and metrics

---

## Next Steps

1. ✅ Set up Cloudflare resources (D1, KV, R2)
2. ✅ Configure GitHub secrets
3. ✅ Update `wrangler.toml` with resource IDs
4. ✅ Push to GitHub to trigger deployment
5. ✅ Verify deployment is successful
6. 🔜 Configure custom domain
7. 🔜 Set up monitoring and alerts

---

## Support

For issues:
- Check [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)
- Check [Cloudflare Pages docs](https://developers.cloudflare.com/pages/)
- Review GitHub Actions logs
- Check Cloudflare dashboard for errors
