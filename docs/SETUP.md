# Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Settings → API**, copy the Project URL, `anon` public key, and `service_role` key.
3. Add them to `.env.local` in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## 2. Create the Database Schema

1. In the Supabase dashboard, open **SQL Editor → New Query**.
2. Paste and run the contents of [`database/schema.sql`](../database/schema.sql).
3. Paste and run [`database/hero-settings-schema.sql`](../database/hero-settings-schema.sql) (hero images + site settings).
4. Apply the migrations in [`supabase-migrations/`](../supabase-migrations) (categories, sessions).
5. Verify in **Table Editor** that these tables exist: `admin_users`, `products`, `orders`, `customers`, `newsletter_leads`, `contact_leads`, `hero_images`, `site_settings`, `categories`, `admin_sessions`.

## 3. Create an Admin User

Run in the SQL Editor (change credentials as needed):

```sql
INSERT INTO admin_users (email, password_hash, name)
VALUES ('admin@example.com', 'change-me', 'Admin User');
```

For production, hash the password with bcrypt instead of storing plain text — see [`scripts/hash-admin-passwords.ts`](../scripts/hash-admin-passwords.ts).

Log in at `/admin/login` with these credentials.

## 4. Set Up Supabase Storage (product & hero images)

1. In the Supabase dashboard, go to **Storage** and create a bucket named `images`, set to **Public**.
2. Add storage policies allowing `SELECT`, `INSERT`, and `DELETE` for the bucket.
3. The app uploads to `products/` and `hero-images/` folders inside this bucket automatically — no manual folder creation needed.
4. Confirm the bucket name matches `lib/supabase-storage.ts` (defaults to `images`).

**Free tier limits:** 1 GB storage, 2 GB bandwidth/month.

### Troubleshooting

- **Row Level Security error:** make sure storage policies from step 2 are created.
- **Images not loading:** confirm the bucket is set to Public.
- **403 Forbidden:** recheck/recreate the storage policies.

## 5. Run the App

```bash
npm install
npm run dev
```

Visit http://localhost:3000 and http://localhost:3000/admin/login.
