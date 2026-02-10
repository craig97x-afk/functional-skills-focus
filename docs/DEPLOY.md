# Deploy

Recommended (Git push)
1) git add -A
2) git commit -m "..."
3) git push origin main

Vercel will build and deploy from main.

Vercel CLI (optional)
- vercel login
- npx vercel --prod

Vercel environment variables
Set the same vars as in docs/BUILD.md.

Common issues
- "Permanent problem cloning repo": check Vercel GitHub app permissions
  and ensure the repo is selected under Vercel app access.
- "Token invalid": run vercel login.
- "NEXT_PUBLIC_SITE_URL warning": set it in Vercel env vars.
