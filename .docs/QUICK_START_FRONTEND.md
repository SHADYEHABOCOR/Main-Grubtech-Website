# 🚀 Quick Start: Deploy Your Frontend (5 Minutes)

Follow these simple steps to get your website live!

---

## Step 1: Open Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com
2. Log in with your Cloudflare account
3. Click **"Workers & Pages"** in the left sidebar
4. Click **"Create application"** (blue button)
5. Click the **"Pages"** tab at the top
6. Click **"Connect to Git"**

---

## Step 2: Connect Your GitHub Repository

1. If asked, authorize Cloudflare to access your GitHub
2. You'll see a list of repositories
3. Select: **"Main-Grubtech-Website"**
4. Click **"Begin setup"**

---

## Step 3: Configure Build Settings

Fill in these exact values:

```
Project name: grubtech-website
Production branch: main

Framework preset: Vite

Build command: npm run build

Build output directory: frontend/dist

Root directory (advanced): frontend
```

**Screenshot of what it should look like:**
```
┌────────────────────────────────────────┐
│ Framework preset:  [Vite        ▼]    │
│ Build command:     npm run build       │
│ Build output:      frontend/dist       │
│ Root directory:    frontend            │
└────────────────────────────────────────┘
```

---

## Step 4: Add Environment Variables

Click **"Environment variables (advanced)"** section

Add ONE variable:

| Variable name | Value |
|--------------|-------|
| `VITE_API_URL` | `https://grubtech-api.shady-ehab.workers.dev` |

**How to add it:**
1. Click "+ Add variable"
2. Type `VITE_API_URL` in the first box
3. Type `https://grubtech-api.shady-ehab.workers.dev` in the second box
4. Leave "Production" selected

---

## Step 5: Deploy!

1. Click **"Save and Deploy"** at the bottom
2. Wait 2-3 minutes while Cloudflare builds your site
3. You'll see a progress screen with logs

**What's happening:**
- Cloudflare is downloading your code
- Installing dependencies (npm packages)
- Building your React app
- Deploying to their global network

---

## Step 6: Get Your URL

When deployment finishes, you'll see:

✅ **Success! Your site is live at:**
`https://grubtech-website-XXX.pages.dev`

Click "Continue to project" to see your dashboard.

---

## Step 7: Test Your Website

1. Click on the deployment URL
2. Your Grubtech website should load!
3. Try clicking around:
   - ✅ Homepage loads
   - ✅ Navigation works
   - ✅ Pages load

---

## Step 8: Update Backend CORS (Important!)

Now we need to tell the backend to accept requests from your new frontend URL.

**Copy your Pages URL** (looks like: `https://grubtech-website-XXX.pages.dev`)

Then run these commands in your terminal:

```bash
cd workers

# Open wrangler.toml and add your Pages URL to ALLOWED_ORIGINS
# Find the line that says:
# ALLOWED_ORIGINS = "https://grubtech.com,https://www.grubtech.com"
#
# Change it to:
# ALLOWED_ORIGINS = "https://grubtech.com,https://www.grubtech.com,https://YOUR-PAGES-URL"
```

Or I can help you with this - just tell me your Pages URL!

After updating, redeploy:
```bash
wrangler deploy --env=""
```

---

## ✅ Done!

Your website is now live! 🎉

**What you have:**
- ✅ Frontend: `https://grubtech-website-XXX.pages.dev`
- ✅ Backend: `https://grubtech-api.shady-ehab.workers.dev`
- ✅ Database: Connected and working
- ✅ Admin panel: Working (try logging in!)

---

## 🔐 Test the Admin Panel

1. Go to: `https://YOUR-PAGES-URL/admin`
2. Login with:
   - Username: `admin`
   - Password: `AdminPass123`
3. You should see the admin dashboard!

---

## 🎯 What's Next?

### Automatic Deployments are Set Up!

Now whenever you push code to GitHub:
- **Push to `main` branch** → Automatically deploys to production
- **Create a pull request** → Creates a preview deployment

No manual steps needed!

---

## ⚠️ Troubleshooting

### Build Failed?

**Check the build logs** in the Cloudflare dashboard. Common issues:

1. **"npm install failed"**
   - Go back and make sure Root Directory is set to `frontend`

2. **"VITE_API_URL not defined"**
   - Add the environment variable (Step 4)

3. **Build succeeds but site is blank**
   - Check browser console (F12) for errors
   - Verify VITE_API_URL is correct

### CORS Errors?

If you see CORS errors in browser console:
- Make sure you completed Step 8
- Double-check the ALLOWED_ORIGINS includes your Pages URL
- Make sure you redeployed the worker

---

## 🆘 Need Help?

Just tell me:
1. What step you're on
2. Any error messages you see
3. Screenshots help!

I'll walk you through it!

---

## 📌 Important URLs

Save these for reference:

- **Frontend**: (You'll get this in Step 6)
- **Backend**: https://grubtech-api.shady-ehab.workers.dev
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **GitHub Repo**: https://github.com/SHADYEHABOCOR/Main-Grubtech-Website

---

Let's deploy! Start with Step 1 and let me know when you need help! 🚀
