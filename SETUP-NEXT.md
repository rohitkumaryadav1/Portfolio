# Finish connecting your portfolio

The source is ready for GitHub. The local preview uses read-only sample responses from the reviewed initial content; admin authentication and writes are not connected yet. No admin password has been created or stored in this repository.

## First: create Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard), sign up, and create a project.
2. Keep the database password private. After the project is ready, find its **Project URL** and **publishable key** in API settings. These two public application values can be shared with your coding assistant. Do not share a service-role key, database password, or admin password.
3. Run the four SQL files in `supabase/migrations` in filename order through SQL Editor. Do this once on a new database. README.md explains each file and the initial image/PDF uploads.
4. Disable public signups. In Authentication → Users, create your administrator with `rohitky9910@gmail.com` and a password you choose and enter privately. Complete email confirmation if required.
5. Copy that Auth user's UUID. In SQL Editor, add it to the allowlist:

```sql
insert into public.admin_users(user_id) values ('YOUR_AUTH_USER_UUID');
```

Only this allowlisted account can administer the website. There is no default password or code-based password bypass.

## Then: connect the app

Use `.env.example` to create your ignored `.env.local`, with the real Supabase URL and publishable key. Restart the app. Upload the initial portrait and public resume into the buckets described in README.md. Visit `/admin`, sign in, and run the connected verification checklist in README.md.

## Finally: create Vercel hosting

Create an account at [Vercel](https://vercel.com/new), connect GitHub, and import `rohitkumaryadav1/Portfolio`. Add the environment variables from README.md and deploy with the Next.js preset. This gives you a public website link. Supabase and Vercel host the backend and website; no local server needs to stay running after deployment.

Passwords, environment files, generated workers, dependencies, and build output must stay out of GitHub. The tracked initial portrait and phone-redacted resume are intentional public portfolio assets.
