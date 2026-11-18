# Your deployed portfolio

Website: https://rohit-kumar-yadav-portfolio.vercel.app

Private admin: https://rohit-kumar-yadav-portfolio.vercel.app/admin

Sign in with `rohitky9910@gmail.com` and the password you created privately in Supabase. No password is stored in this repository.

## Connected services

- GitHub: https://github.com/rohitkumaryadav1/Portfolio, branch `main`.
- Vercel: `rohit-251a/rohit-kumar-yadav-portfolio`; Next.js preset, repository root, Hobby plan.
- Supabase: `soetxwrjrhztzloqtmpo`; all four migrations applied, RLS enabled, public signups disabled, one administrator allowlisted.
- Initial portrait and public resume uploaded through the real admin UI. Their unique paths are stored in profile data, not source code.
- Production environment has the Supabase URL, publishable key, and site URL. No database password or secret key is needed by the application.

## Updating content

Open `/admin`, sign in, edit content, and save. Published changes appear without redeployment. Use Profile to replace your photograph or resume. Use Projects for project notes, links, screenshots, featured/current-build selection, and publication. Log out when finished.

## Updating code

Read CHAT.md, make changes, run relevant checks, and push to `main`. Vercel builds changes automatically. Manage deployment and domain settings at https://vercel.com/rohit-251a/rohit-kumar-yadav-portfolio.

Do not rerun the initial seed. SQL Editor migrations do not automatically populate CLI migration history; reconcile that history before any future `supabase db push`. Keep actual environment files and passwords out of GitHub. See README.md for a clean installation and recovery instructions.
