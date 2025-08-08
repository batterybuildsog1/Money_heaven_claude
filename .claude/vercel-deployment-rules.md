MEMORIZE: Vercel Deployment Best Practices

NEVER run 'vercel --prod' directly as it creates duplicate deployments that break auth.

CORRECT DEPLOYMENT PROCESS:
1. First check if already linked: 'vercel ls' or check .vercel/project.json
2. If changes are committed, Vercel auto-deploys from GitHub (preferred)
3. If manual deploy needed: 
   - Use 'vercel' (without --prod) for preview
   - Then 'vercel promote <deployment-url>' to promote to production
4. Or use 'git push' to trigger automatic deployment

WHY IT BREAKS:
- Each 'vercel --prod' creates a new deployment with different URLs
- Auth callbacks are tied to specific URLs in Google OAuth
- Multiple production deployments cause URL mismatches
- Cookie domains get confused between deployments

ALWAYS CHECK FIRST:
- Current project: 'cat .vercel/project.json 2>/dev/null || echo "Not linked"'
- Latest deployment: 'vercel ls | head -3'
- Current production URL: 'vercel inspect --json | grep "alias"'

PROJECT INFO:
- Project name: money_heaven_claude
- Production URL: https://moneyheavenclaude.vercel.app
- Convex URL: https://calm-ibis-514.convex.cloud
