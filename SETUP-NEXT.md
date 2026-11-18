# Finish connecting your portfolio

Supabase project `soetxwrjrhztzloqtmpo` is connected to the local app. All four migrations, reviewed content, RLS, and private image/PDF buckets were applied on 18 November 2026. Public signups are disabled. Do not rerun the migrations or seed on this database. Actual local environment values are ignored by Git.

## Next: finish your administrator

1. In the open Supabase Authentication → Users → Create new user form, enter your password privately for `rohitky9910@gmail.com`, leave Auto confirm checked, and create the user. Do not send the password in chat.
2. Copy the resulting UUID. Through the trusted SQL Editor, allowlist that account:

```sql
insert into public.admin_users(user_id) values ('YOUR_AUTH_USER_UUID');
```

Only this allowlisted account can administer the website. No default password or authentication bypass exists. Browser credential-entry rules require the owner to enter and submit the new password.

3. Upload `assets/initial/rohit-yellow-hoodie.webp` to `portfolio-media/initial/rohit-yellow-hoodie.webp` and `assets/initial/rohit-resume.pdf` to `portfolio-documents/initial/rohit-resume.pdf`. Both buckets stay private. Alternatively upload and save them through Admin → Profile after signing in. For automated Brave uploads, enable Allow access to file URLs under the ChatGPT extension's Details in `brave://extensions`.
4. Visit http://127.0.0.1:3000/admin and sign in privately. Complete the connected CRUD/publication/image/PDF checklist in README.md.

## Connection verification

```powershell
node --env-file=.env.local scripts/verify-supabase.mjs
```

This read-only check already passes for the real project. Authenticated CRUD and uploads still need owner login. SQL Editor migrations do not automatically populate CLI migration history; reconcile history before any future `supabase db push`.

## Finally: Vercel hosting

Sign in at https://vercel.com/new, connect GitHub, and import `rohitkumaryadav1/Portfolio`. Set the three variables from `.env.example`, use your actual publishable key, set `NEXT_PUBLIC_SITE_URL` to the production HTTPS domain, and deploy with the Next.js preset. Then update Supabase's Auth site URL and verify production login/content/uploads. This provides the public website link; no local backend must remain running.

Keep passwords, secret keys, environment files, generated workers, dependencies, and build output out of GitHub. The tracked portrait and phone-redacted resume are intentional public portfolio assets.
