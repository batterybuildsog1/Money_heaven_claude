# Deployment Guide

## Production URLs
- **Live App**: https://moneyheavenclaude.vercel.app
- **Convex Dashboard**: https://dashboard.convex.dev/d/calm-ibis-514
- **Vercel Dashboard**: https://vercel.com/alan-sunhomesios-projects/moneyheavenclaude

## Quick Deploy

```bash
# 1. Deploy Convex Backend
npx convex deploy --yes

# 2. Deploy Frontend to Vercel
vercel --prod --yes
```

## Environment Variables

### Convex (Set via CLI or Dashboard)
```bash
# Authentication
AUTH_GOOGLE_ID          # Google OAuth Client ID
AUTH_GOOGLE_SECRET      # Google OAuth Client Secret
JWT_PRIVATE_KEY         # Generated JWT key
JWKS                    # Generated public key
SITE_URL                # https://moneyheavenclaude.vercel.app

# API Keys
XAI_API_KEY            # xAI API key
GROQ_API_KEY           # Groq API key
```

### Vercel (Set via Dashboard)
```
NEXT_PUBLIC_CONVEX_URL   # https://calm-ibis-514.convex.cloud
API_NINJAS_KEY          # API Ninjas key
GROQ_API_KEY            # Groq API key
XAI_API_KEY             # xAI API key
```

## Google OAuth Setup

### Google Cloud Console
1. Go to https://console.cloud.google.com
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID

### Required Settings
**Authorized JavaScript Origins:**
- http://localhost:3000
- https://moneyheavenclaude.vercel.app

**Authorized Redirect URI (EXACT):**
- https://calm-ibis-514.convex.site/api/auth/callback/google

## Troubleshooting

### Auth Issues
- Verify Google OAuth redirect URI is EXACT: `https://calm-ibis-514.convex.site/api/auth/callback/google`
- Check Convex has AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET set
- Ensure SITE_URL matches your Vercel deployment

### Deployment Errors
- If Convex deploy fails, check `npx convex logs` for errors
- For Vercel issues, check build logs at https://vercel.com/alan-sunhomesios-projects/moneyheavenclaude

### Local Development
```bash
# Start both servers
npm run dev          # Next.js on port 3000
npx convex dev       # Convex backend (separate terminal)
```

## Maintenance

### Update API Keys
```bash
# Convex
npx convex env set KEY_NAME "new-value" --prod

# Vercel - Use dashboard at:
# https://vercel.com/alan-sunhomesios-projects/moneyheavenclaude/settings/environment-variables
```

### View Logs
```bash
npx convex logs --prod    # Convex function logs
vercel logs              # Vercel deployment logs
```

### Database Management
- Access at: https://dashboard.convex.dev/d/calm-ibis-514/data
- Tables: scenarios, mortgageRates, propertyTaxData
- Cron jobs run daily for rate updates and cache cleanup