# Fix CONVEX_DEPLOY_KEY Environment Variable in Vercel

## Problem
Error: "Detected a non-production build environment and "CONVEX_DEPLOY_KEY" for a production Convex deployment"

This error occurs when the `CONVEX_DEPLOY_KEY` environment variable is configured for non-production environments (Preview/Development) in Vercel, but it should only be used in Production builds.

## ⚠️ Critical Warning
**NEVER configure `CONVEX_DEPLOY_KEY` for Preview or Development environments.** This key is specifically for production deployments and will cause build failures if used elsewhere.

## Step-by-Step Fix Guide

### Step 1: Navigate to Vercel Environment Variables
1. Go to [vercel.com](https://vercel.com) and log in to your account
2. Click on your project: **moneyheavenclaude**
3. Click on the **Settings** tab at the top of the project dashboard
4. In the left sidebar, click on **Environment Variables**

### Step 2: Locate the CONVEX_DEPLOY_KEY Variable
1. Scroll through your environment variables list
2. Find the entry named `CONVEX_DEPLOY_KEY`
3. Click the **Edit** button (pencil icon) next to this variable

### Step 3: Configure Environment Checkboxes
**CRITICAL: Only check the Production checkbox**

In the "Environments" section, you'll see three checkboxes:
- [ ] **Development** - ❌ **UNCHECK THIS**
- [ ] **Preview** - ❌ **UNCHECK THIS**  
- [x] **Production** - ✅ **CHECK ONLY THIS ONE**

### Step 4: Save Changes
1. Ensure only **Production** is checked
2. Click **Save** to apply the changes
3. You should see a confirmation that the environment variable was updated

### Step 5: Verify Configuration
After saving, the variable should show:
```
CONVEX_DEPLOY_KEY
Value: [hidden]
Environments: Production
```

### Step 6: Redeploy to Apply Changes
1. Go to the **Deployments** tab
2. Click **Redeploy** on your latest production deployment
3. Select **Use existing Build Cache** (recommended)
4. Click **Redeploy**

## Why This Fix Works

### Environment Variable Behavior in Vercel
- **Development**: Used when running `vercel dev` locally
- **Preview**: Used for branch deployments and pull request previews  
- **Production**: Used for main branch deployments to your live domain

### Convex Deploy Key Purpose
The `CONVEX_DEPLOY_KEY` is specifically designed for:
- Production builds only
- Authenticating with your production Convex deployment
- Should never be used in development or preview environments

### What Happens if Misconfigured
❌ **If enabled for Development/Preview:**
- Build will fail with environment detection error
- Convex will reject the non-production build attempt
- Deployments will be blocked

✅ **When configured correctly (Production only):**
- Production builds authenticate properly with Convex
- Preview deployments use the public `NEXT_PUBLIC_CONVEX_URL` instead
- Development uses local Convex dev server

## Additional Environment Variables Setup

Ensure these variables are also properly configured:

### NEXT_PUBLIC_CONVEX_URL
- **Value**: `https://calm-ibis-514.convex.cloud`
- **Environments**: ✅ Development, ✅ Preview, ✅ Production
- **Purpose**: Public URL for Convex client connections

### Other API Keys (Production Only)
These should also be **Production only**:
- `XAI_API_KEY`
- `API_NINJAS_KEY` 
- `GROQ_API_KEY`

## Troubleshooting

### If Error Persists After Changes
1. Wait 2-3 minutes for Vercel to propagate changes
2. Try a fresh deployment (not redeploy)
3. Check that no other environment variables are misconfigured

### If Build Still Fails
1. Verify the `CONVEX_DEPLOY_KEY` value is correct
2. Check Convex dashboard to ensure the deployment key is active
3. Review the full build logs for other potential issues

### How to Get a New Deploy Key (if needed)
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project: **calm-ibis-514**
3. Go to **Settings** → **Deploy Keys**
4. Generate a new key if the current one is invalid

## Success Indicators
✅ Build completes without environment errors  
✅ Production deployment works correctly  
✅ Preview deployments don't attempt to use the deploy key  
✅ Authentication flows work in production

## Related Documentation
- [Convex Deployment Guide](https://docs.convex.dev/production/hosting/vercel)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)