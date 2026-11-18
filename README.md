# Rohit Kumar Yadav — Portfolio

A responsive Next.js portfolio with a private `/admin` content studio, Supabase Auth, PostgreSQL, and private image storage. The public site has no admin navigation link. The supplied yellow hoodie portrait is included as an optimized upload asset.

## Current status

For the shortest account-connection checklist, start with [SETUP-NEXT.md](SETUP-NEXT.md). There is no default admin password; the owner creates it privately in Supabase Authentication and allowlists that user's UUID.

Live website: [https://rohit-kumar-yadav-portfolio.vercel.app](https://rohit-kumar-yadav-portfolio.vercel.app). Private administration: [https://rohit-kumar-yadav-portfolio.vercel.app/admin](https://rohit-kumar-yadav-portfolio.vercel.app/admin). Sign in with the owner's Supabase email and privately chosen password.

GitHub `main` is connected to Vercel project `rohit-kumar-yadav-portfolio` under team `rohit-251a`. Supabase project `soetxwrjrhztzloqtmpo` hosts the content, Auth, and private storage. All four migrations were applied on 18 November 2026; do not rerun them or the seed. Public signups are disabled and the single owner account is allowlisted. The supplied portrait and phone-redacted resume were uploaded through the admin panel. Runtime content comes only from Supabase.

## 1. Install and run

Install Node.js 22 LTS or later and pnpm 11. Then, in this directory:

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

Open http://localhost:3000. Stop and restart the server after changing `.env.local`.

## 2. Create Supabase from scratch

The existing owner project has already completed the migration steps below. These instructions also document recovery on a new project. SQL Editor setup does not require installing the CLI or sharing a database password.

1. Create an account at [Supabase](https://supabase.com/dashboard) and create a new project. Choose a region near your audience and keep the database password in your password manager.
2. In the project's SQL Editor, run all migration files in filename order: `202611180001_schema.sql`, `202611180002_content.sql`, `202611180003_project_journal.sql`, and `202611180004_resume.sql`. Run each once on a fresh project. These create content tables, the administrator allowlist, policies, private media/documents buckets, initial content, project journal constraints, and resume storage. On an existing database, run only unapplied migrations; do not rerun the initial seed.
3. Find the project URL and **publishable key** in project API settings. Put them in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Check the configured hosted connection without writing data:

```powershell
node --env-file=.env.local scripts/verify-supabase.mjs
```

This checks published content reads, anonymous admin denial, private allowlist access, and disabled signups. It does not substitute for authenticated CRUD/upload testing.

The publishable key is intended for public applications. Authorization comes from Auth and database policies. This application never needs a service-role key.

## 3. Create the sole administrator

1. In Supabase Authentication, disable public signups. Keep email/password sign-in enabled. Configure Auth rate limits; the application uses Supabase's password authentication rate limiting.
2. Under Authentication → Users, create your own email/password user using your email. Complete any required email confirmation. Choose your password yourself; do not put it in source files or share it in chat.
3. Copy that user's UUID. In SQL Editor, run this, replacing the placeholder:

```sql
insert into public.admin_users(user_id)
values ('YOUR_AUTH_USER_UUID');
```

The unique singleton constraint permits only one administrator. Application users cannot read or alter this table, promote themselves, or create a second administrator. To change accounts later, update the existing allowlist row through the trusted SQL Editor.
4. Restart the app, manually visit `/admin`, and sign in. There is no signup or public admin link. Log out with the dashboard button. Password reset/recovery is managed through Supabase's dashboard for this first release; there is no custom recovery UI.

## 4. Add your photograph

The initial profile references `initial/rohit-yellow-hoodie.webp` in the private bucket.

Either upload `assets/initial/rohit-yellow-hoodie.webp` through Supabase Storage into an `initial` folder in `portfolio-media` with that exact filename, or open Admin → Profile, choose the same file, inspect its preview, click **Use this image**, then **Save changes**. The latter creates a unique upload path automatically.

You can replace or remove it in the same editor. A removed image disappears from the profile after saving. Old files remain private for recovery and can be cleaned through Supabase Storage after checking they are no longer referenced. Signed URLs can remain usable for up to 60 seconds after unpublishing/removing their reference.

### Resume PDF

Upload `assets/initial/rohit-resume.pdf` to the private `portfolio-documents` bucket as `initial/rohit-resume.pdf`, or use Admin → Profile → Resume PDF. Choose a PDF, preview it, click **Use this resume**, then **Save changes**. The initial public copy removes the phone number per your privacy preference; the source PDF outside this project is preserved. Future uploads are not automatically redacted, so review their personal details before publishing.

The header has **My resume** (opens `/resume` in a new tab) and a download icon (`/api/resume?download=1`). The viewer uses PDF.js with page/zoom controls and an accessible text alternative, so it also works in browsers without a native PDF plugin. `/api/resume` serves the current PDF bytes. Both read the current published profile's file path dynamically. Uploads accept valid, unencrypted PDFs under 4 MB with 1–20 pages and reject executable PDF actions/attachments. PDFs remain private until referenced by the published profile. Replacement/removal takes effect after saving; old files stay private for manual cleanup.

Uploads accept JPEG, PNG, and WebP under 4 MB. The server decodes, auto-rotates, resizes to at most 1600 × 1600, and re-encodes to WebP. Invalid files and images above 25 million pixels are rejected. Individual uploads fit Vercel's function request-size limits. Screenshots are added one at a time.

## 5. Manage content

- **Projects:** create/edit/delete, publish/unpublish, full descriptions, technology lists, status, dates, HTTPS repository/demo links, cover image, screenshots, featured toggle, and display order. Also manage project bullet points, blog/notes text, external blog URL, YouTube URL, and Vercel/live demo URL. There is no fixed project count.
- **Currently building:** select one published In Progress project using “Show in Currently building.” Uncheck the previous selection before publishing a new one. A database constraint prevents two published current builds. If none is selected, the first published In Progress project is shown. The current build also appears in Projects, including when featured-only filtering is enabled. Hero and project cards open the same accessible journal popup. Use `## Heading` lines for headings in notes. Missing video/demo/blog URLs do not become fake links. Until a repository is supplied, the supplied account link is labeled “GitHub profile.”
- **Footer portrait:** your editable profile photo appears beside “Let’s make something useful.” The hero contains the compact current-project thumbnail instead. Thumbnail artwork is a conceptual illustration, not a fabricated product screenshot.
- **Experiences:** organizations, positions, ministry, locations, dates, descriptions, responsibilities, achievements, technologies, publication, and order.
- **Profile:** name, headline, introduction, about text, contact email, social URLs, location, focus text, and portrait.
- **Skills / education / interests:** create, update, delete, publish, and order. Interest visibility starts disabled and no hobbies are invented.
- **Site settings:** title, SEO description, footer text, section visibility, and featured-only project filtering. Social URLs are managed once in Profile and reused across the website.

List fields use one item per line. Blank optional dates and URLs remain blank. Dates in the source resume specify months, so seed dates use day 01 and public experience dates display only month/year. Never treat that day as a verified exact date. Save a record to apply changes; choosing/uploading a file alone does not save the profile/project. Public pages query published records per request, so no redeployment is needed for content changes.

## 6. Verify your connected project before launch

Run `pnpm test`, `pnpm typecheck`, and `pnpm build`.

The tests execute the actual migrations and seed in a disposable PostgreSQL engine (PGlite), with small Auth/Storage schema stubs. They validate seeded payloads, single-admin enforcement, admin project/experience create/edit/publish/unpublish/delete flows, anonymous read boundaries, unauthorized writes, and profile media replacement/removal policies. They do **not** substitute for testing hosted Supabase Auth, Storage HTTP endpoints, cookie refresh, and Vercel.

After configuring Supabase, verify this checklist:

1. In a private browser window, `/admin` redirects to login. An anonymous POST to an admin API cannot write.
2. Log in, create a draft project, edit it, and save. Confirm it stays hidden in the private window and cannot be opened by ID.
3. Publish it; refresh the private window and confirm its detail page appears. Unpublish it; confirm its listing/detail disappear. Delete it and confirm it is gone after reloading Admin.
4. Repeat create/edit/publish/unpublish/delete for a disposable experience.
5. Upload a profile photo, save, reload and verify persistence. Replace it, save, and verify publicly. Remove it and save; the placeholder should appear.
6. Attempt to modify content with a different authenticated user: policies must deny it. Re-disable signups after any controlled test.
7. Check mobile/tablet/desktop navigation, project links, theme toggle, keyboard focus, image loading, and logout.

The visual QA helper `tests/preview-server.mjs` serves only seed fixtures and the supplied portrait. It is read-only, has no login/persistence, and is never used by the production app. For isolated design review, start it with `node tests/preview-server.mjs`, then run a separate dev process with `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54399` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=visual-qa-fixture-only`. Do not put those fixture values in production or confuse fixture output with working Supabase. Stop both processes afterwards.

## 7. Connect GitHub

The folder is ready for its own repository; keep the parent resume and other projects outside it. Create an empty repository in your GitHub account, then:

```powershell
git init -b main
git add .
git status
git commit -m "Build portfolio and private content studio"
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

Review staged files before committing. `.env.local`, build output, dependencies, local configuration, and temporary files are ignored. The provided portrait is intentionally tracked as an initial upload asset; the original resume and phone number are not included; the intentionally prepared public resume copy is tracked as an initial upload asset.

## 8. Deploy on Vercel

1. Sign in to [Vercel](https://vercel.com/new), import the GitHub repository, and use the Next.js preset. Root Directory is this folder if you chose a repository containing a parent directory.
2. Set the three environment variables above. Use your real Supabase URL/key and set `NEXT_PUBLIC_SITE_URL` to your final HTTPS domain. Never add a service-role key.
3. Use Node.js 22 or 24, install with `pnpm install --frozen-lockfile`, build with `pnpm build`, and leave the default Next.js output setting.
4. Deploy. If the assigned domain was not known beforehand, update `NEXT_PUBLIC_SITE_URL` and redeploy once. Add the production site URL in Supabase Auth URL configuration. No local backend is needed: Next.js runs on Vercel and Supabase hosts data, Auth, and Storage.
5. Repeat the connected verification checklist on the deployed domain. Add a custom domain through Vercel if desired.

## Architecture and decisions

- Next.js App Router server components render public content; dynamic rendering keeps publication changes immediate.
- `/admin` is server protected using verified `auth.getUser()` plus the database `is_admin()` allowlist. Every mutation repeats this check; route hiding is not an access control.
- Supabase SSR cookies are HttpOnly, SameSite=Lax, and Secure in production. Proxy refreshes sessions on admin pages/APIs; admin responses are not publicly cached. Server Actions use Next.js origin checks; JSON/upload APIs require same-origin requests.
- Every content table has `id`, `data`, `published`, `display_order`, and timestamps. Flexible `data` JSONB holds typed section-specific fields; Zod validates all API writes and public reads. Shared relational columns enforce publication/order and support indexed queries. This small CMS needs no cross-content relationships; `admin_users.user_id` references Auth.
- RLS allows anonymous reads only for published rows, and writes only for the allowlisted administrator. Draft media is private; the media route signs only files allowed by the caller's Storage policies.
- React escapes text; no arbitrary HTML rendering. External URLs must be HTTPS. No fake contact form: email opens the visitor's mail app.
- Resume claims are attributed where shown. Exact stacks, URLs, and dates for the first two projects remain unset until supplied. The project artwork is typographic illustration, not fabricated application screenshots.

## Interactive presentation

### Interactive presentation now implemented

The footer includes a spherical Canvas globe using D3's orthographic projection, bundled Natural Earth land geometry, a Delhi city marker, slow auto-rotation, pointer dragging, wheel zoom, keyboard arrows/+/- controls, and visible zoom/pause/find-Delhi buttons. The globe pauses drawing while offscreen or the page is hidden. A restrained Canvas mesh reacts to pointer movement across the public background. Users can pause the mesh; system reduced-motion preference disables automatic movement. Labels, dates, body copy, and experience content are larger, and the date column is narrower.

Map data: [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) (public domain). Projection: [D3 geoOrthographic](https://d3js.org/d3-geo/azimuthal#geoOrthographic). Geometry is bundled locally; no third-party map service or tracking is used.

The first release still excludes a chatbot. A future chatbot should use a separate server endpoint with explicit scope, rate limits, and private API credentials. Richer WebGL visuals are optional future work; the current globe already supports spherical rotation and zoom without a full 3D engine.

Read `CHAT.md` before future AI-assisted changes. Design references: [Uncommon](https://uncommondesign.group/) and [Godly](https://godly.design/sites/). Implementation references: [Next.js](https://nextjs.org/docs), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), and [Storage policies](https://supabase.com/docs/guides/storage/security/access-control).
