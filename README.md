# Buna House Coffee Shop

Full-stack e-commerce site for a coffee shop in Bole, Addis Ababa, built with Next.js (App Router) and Supabase. It includes a public storefront (menu, cart, checkout) and an admin dashboard (products, orders, customers, leads, analytics) served from the same app via Next.js API routes — there is no separate backend service.

## Screenshots

| Storefront | Menu | Admin Dashboard |
| --- | --- | --- |
| ![Storefront hero section](screenshots/Screenshot%20From%202026-09-30%2011-35-16.png) | ![Menu with categories](screenshots/Screenshot%20From%202026-09-30%2011-35-24.png) | ![Admin dashboard](screenshots/Screenshot%20From%202026-09-30%2011-35-30.png) |

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Database / Auth / Storage:** Supabase (Postgres, Row Level Security, Storage buckets)
- **Password hashing:** bcryptjs
- **Rate limiting:** express-rate-limit

## Project Structure

```
app/
  api/                Backend endpoints (auth, products, orders, customers, leads, dashboard, search, notifications)
  admin/              Admin dashboard pages
  checkout/           Checkout flow
  order-confirmation/
components/           Shared React components (header, cart, product cards, etc.)
lib/                  Server/client utilities (supabase clients, auth, caching, validation, rate limiting)
database/             SQL schema for the Supabase project
supabase/             Supabase CLI migrations
supabase-migrations/  Additional standalone SQL migrations
scripts/              One-off maintenance scripts (e.g. hashing admin passwords)
public/               Static assets
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables — create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
3. Set up the database and storage — see [docs/SETUP.md](docs/SETUP.md).
4. Run the dev server:
   ```bash
   npm run dev
   ```
   App runs at http://localhost:3000, admin dashboard at http://localhost:3000/admin.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `./validate.sh` | Sanity-check that required files/config are in place |
| `./test-all.sh` | Broader pre-demo checklist script |

## Documentation

- [docs/SETUP.md](docs/SETUP.md) — Supabase database, storage buckets, and admin user setup
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Deploying to Vercel or a self-hosted server
