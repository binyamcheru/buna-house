# Deployment Guide

## Pre-Deployment Checklist

- [ ] Database schema and migrations applied (see [SETUP.md](SETUP.md))
- [ ] Supabase Storage bucket configured
- [ ] Real products added (no test data)
- [ ] Default admin credentials changed
- [ ] Site tested on mobile
- [ ] `npm run build` runs with no errors

## Option 1: Vercel (Recommended)

1. Push the repository to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Framework preset: Next.js. Build command: `npm run build`. Output: `.next`.
4. Add environment variables (**Settings → Environment Variables**):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
5. Deploy. Every push to the main branch triggers an automatic redeploy.
6. (Optional) Add a custom domain under **Settings → Domains**.

## Option 2: Self-Hosted (VPS)

Requirements: Ubuntu 22.04+, Node.js 18+, PM2, Nginx, SSL certificate.

```bash
npm install
npm run build
pm2 start npm --name "roast-and-co" -- start
pm2 save
pm2 startup
```

Example Nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment

- Change the default admin password immediately after first login.
- Verify Row Level Security is enabled on all Supabase tables.
- Set up automated Supabase backups.
- Confirm `next.config.ts` `images.remotePatterns` matches your production Supabase hostname.
- Never commit `.env.local` — environment variables are configured per-environment in Vercel/PM2.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Build fails | Check env vars are set; run `npm run build` locally to reproduce |
| Site loads but data is missing | Verify Supabase env vars and that RLS policies allow the expected access |
| Images don't load | Confirm the Supabase Storage bucket is public and hostname is in `next.config.ts` |
