# NexStep

React + Vite + Tailwind website with a Supabase backend (login, database, file storage, security rules, admin dashboard).

GitHub only stores your code and hosts the website pages. **Supabase** is the backend that makes login, applications and the admin dashboard work. You need both (both free).

## Step 1: Create the backend (Supabase)
1. Go to https://supabase.com, sign up, click **New project**. Pick any name and a strong database password.
2. Open **SQL Editor → New query**. Paste everything from `supabase/migrations/001_schema.sql` and click **Run**. It should say "Success".
3. Open **Project Settings → API**. Keep this page open: you need the **Project URL** and the **anon public** key.

## Step 2: Put the website on GitHub
1. Create a new GitHub repository (e.g. `nexstep`) and upload everything in this folder to the `main` branch.
2. In the repo go to **Settings → Secrets and variables → Actions → New repository secret** and add two secrets:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
3. Go to **Settings → Pages**, set **Source** to **GitHub Actions**.
4. Go to the **Actions** tab, open "Deploy NexStep to GitHub Pages" and wait for the green tick. Your site is at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

## Step 3: Tell Supabase your website address
In Supabase open **Authentication → URL Configuration**:
- **Site URL**: your GitHub Pages address (with the trailing `/`)
- **Redirect URLs**: add `https://YOUR-USERNAME.github.io/REPO-NAME/**`

Also check **Authentication → Providers → Email**: keep **Confirm email** switched ON.

## Step 4: Become the admin (only you)
1. On your live site click **Sign up** using **shin19874@gmail.com**, then click the link in the verification email.
2. In Supabase **SQL Editor** run everything in `supabase/migrations/002_make_admin.sql`.
3. Log in on the site: an **Admin** button appears in the menu. Nobody else can get it, because roles can't be written from the website at all.

## Step 5: Add content
Admin → Webinars / Courses / Internships → **Add**. Fill the form, upload a poster, tick **Published**. It appears on the public pages instantly.

## Step 6 (optional): Emails
The site works without this; status changes just won't send email (the admin screen tells you).
1. Create a free account at https://resend.com and make an API key. (To email anyone you must verify a domain in Resend.)
2. Install the Supabase CLI (https://supabase.com/docs/guides/cli), then in this folder run:
```
supabase login
supabase link --project-ref YOUR-PROJECT-ID
supabase secrets set RESEND_API_KEY=re_xxx FROM_EMAIL="NexStep <hello@yourdomain.com>"
supabase functions deploy send-email
```

## Run on your computer (optional)
Copy `.env.example` to `.env`, fill in both values, then `npm install` and `npm run dev`.

## How security works
- Rules live in the database (Row Level Security), not just in the website code.
- Only the admin role can create/edit/delete listings and upload posters.
- Users can read only their own applications; applications are forced to "pending", tied to the logged-in user, blocked when closed, and duplicates are rejected by the database.
- Only the public anon key is in the website. Never put a `service_role` key in this project.
