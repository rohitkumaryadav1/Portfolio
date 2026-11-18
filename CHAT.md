# Persistent project instructions

Read this file before modifying the project in any future session. Update it after significant architecture changes. Read README.md for account setup, commands, deployment, and verification. Preserve existing work; do not invent professional claims or replace working components unnecessarily.

## Project overview

Personal portfolio for Rohit Kumar Yadav, Computer Science Engineering undergraduate at GGSIPU Delhi, expected graduation 2029, CGPA 8.09/10.00. Honest student/builder positioning. Public site plus an unlinked, private `/admin` CMS. User selected the yellow hoodie photograph; the second photograph is unused.

## Architecture and stack

Next.js 16.4.6 App Router, React 19.3.1, TypeScript, Tailwind 4, Motion, Lucide, Supabase SSR/Auth/PostgreSQL/Storage, Zod, Sharp, D3 Geo, pdf-lib, and PDF.js. pnpm lockfile pins resolved versions. Vercel deployment; no persistent local backend. Public content is queried per request. No runtime seed fallback, service-role key, public signup, contact-form backend, or chatbot.

## Folder structure

- `src/app`: public homepage, project detail, private admin/login, admin JSON/upload APIs, media route, sitemap, robots, errors.
- `src/components`: theme toggle, reduced-motion-aware reveal, reusable typed admin content editor.
- `src/sections`: project showcase and experience presentation components; profile portrait includes a graceful image-error placeholder.
- `src/lib/content.ts`: Zod schemas, TypeScript content types, default empty editor values, allowed table names.
- `src/lib/supabase.ts`: server-only SSR client, configuration, verified identity/allowlist checks.
- `src/lib/data.ts`: published content reads and media paths.
- `src/proxy.ts`: session cookie refresh for admin paths.
- `supabase/migrations`: schema/policies then reviewed initial content.
- `scripts/prepare-content.py`: developer-only seed generator. Runtime never imports it. Do not rerun seed on an existing edited database.
- `assets/initial`: optimized supplied portrait to upload to private Storage.
- `tests`: content validation tests, PostgreSQL migration/RLS tests, isolated read-only visual fixture server.

## Database schema

Seven content tables: profile, projects, experiences, skills, education, interests, site_settings. Each has UUID primary key, JSONB `data`, `published` boolean, `display_order` integer, `created_at`, `updated_at`. Triggers touch update times; indexed publication/order. Profile and settings are singletons. `admin_users` has one allowed Auth user FK and a unique singleton constraint. All content fields are defined in `content.ts`; do not change a shape without migration/seed/type/editor/read review.

Projects include descriptions, technology array, status, GitHub/demo URLs, optional dates, featured flag, image path and screenshot paths. Experiences include role, organization/ministry, dates/location, description, responsibilities/achievements/technologies. Profile stores social/contact fields centrally. Settings manages SEO/footer/visibility/featured filtering. Interests has no initial records and is hidden.

## Authentication and security

Verified server `getUser()` plus `is_admin()` checks guard admin page and every API mutation. The allowlist is SQL-managed only; no role creation API. Supabase RLS is the data boundary, including for direct SDK requests. Public readers see published rows; only administrator writes. HttpOnly cookies with production Secure and SameSite=Lax. Proxy refreshes admin sessions and sets private/no-store. Never authorize with an unverified `getSession()` value. No service-role key exists in this app.

Private `portfolio-media` bucket. Storage SELECT requires an admin or reference from a published profile/project. `/media/...` checks path syntax and issues a 60-second signed URL using the caller's permissions. Old signed URLs can live until expiration. Upload endpoint authenticates, checks origin/type/size, decodes with Sharp, limits pixels, resizes and re-encodes. Old unreferenced objects remain private and need manual cleanup. Never make the bucket public to solve an upload problem.

Admin APIs allow only named tables and Zod-valid fields; write failures are visible. React text escaping, HTTPS outbound URL validation, no arbitrary HTML. Public phone number prohibited by default. No admin link in public navigation/footer. Same-origin JSON/upload mutation checks. Built-in Supabase Auth rate limits must be configured at setup.

## Environment

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`. Actual values belong in ignored `.env.local` and Vercel. Publishable keys are public by design; passwords/service-role/database credentials must never be committed or logged.

## Coding conventions

Strict TypeScript, small understandable helpers, server-only database access modules, typed schema-first content, accessible labels/focus, explicit loading/error states. Keep dependencies restrained. Check installed Next.js docs as required by AGENTS.md. Read relevant guide before changing framework APIs. Run typecheck/tests/build for substantive changes; avoid test repetition without a new reason.

## Design system

Latest visual revision: boxed bold resume navigation, sage/sand/blue/cream section panels with borders and restrained gradients, and a stronger tidal canvas mesh with cursor displacement, ripples, and floating nodes. Dark mode has dedicated panel colors. Pause/reduced-motion behavior remains available. The fixture-backed admin login now explicitly says no account/password exists instead of showing an unusable sign-in form; there is no authentication bypass or default password.

Latest interactive revision: footer is a three-column composition on wide screens: contact text, spherical globe, portrait. `FooterGlobe` uses a dynamically imported D3 orthographic projection and bundled public-domain Natural Earth polygons (`public/data/land.geojson`, ring orientation normalized for D3). Drag/wheel/keyboard rotation/zoom and visible controls are supported; Delhi (77.209 E, 28.614 N) has a city marker and accessible location text. The globe renders only near the viewport, honors reduced motion for auto-rotation, and has a location fallback. `AmbientMesh` adds a pointer-responsive, low-opacity canvas grid and a pause control; it does not intercept clicks. Body text and labels are larger; experience dates now occupy a narrower column.

Resume management: profile adds `resume_path` with backward-compatible validation. Migration `202611180004_resume.sql` creates private `portfolio-documents` storage and permits anonymous reads only for the file attached to a published profile. `/api/admin/resume` repeats origin/auth checks, validates PDF type/size/page count/encryption/actions with pdf-lib, and uploads with a unique path. Admin Profile includes preview/upload/replace/remove; save applies the path. `/resume` is a dedicated PDF.js viewer with page/zoom controls and accessible extracted text. `/api/resume` serves the published file inline; `/api/resume?download=1` serves an attachment. The PDF.js worker is copied locally by `scripts/prepare-pdf-worker.mjs` in postinstall/predev/prebuild; the generated worker is git-ignored. Header exposes both. Initial `assets/initial/rohit-resume.pdf` removes the source phone number; original is preserved outside the repository. Future uploads require the owner to review personal details and are not automatically redacted. Upload the initial PDF to `initial/rohit-resume.pdf` in the documents bucket during setup.

Latest layout revision: hero portrait replaced by a compact Currently building project feature; the portrait is now in the contact footer beside “Let’s make something useful.” Hero is followed immediately by Experience, then Projects, then About. Header navigation and numbered labels follow that order. The bordered “Scroll to experience” anchor jumps to the next section; normal scrolling remains available. The hero Contact me button opens the profile email directly; header Let’s talk still jumps to the contact footer.

Hero and project listings share `ProjectFeature`, an accessible native dialog with body scroll locking, Escape/backdrop/close dismissal, focus restoration, notes, bullet points, screenshots, and optional blog/GitHub/YouTube/Vercel links. `ProjectJournal` safely renders paragraphs and `## ` headings without arbitrary HTML. No video is embedded. The supplied GitHub profile is a labeled fallback, never described as a project repository.

Project data adds `blog_url`, `youtube_url`, `blog_content`, `highlights`, and `currently_building`, with backwards-compatible Zod defaults. `demo` remains the Vercel/live URL. Migration `202611180003_project_journal.sql` backfills old rows, supplies factual Mail Trace Monitor notes, and enforces one published current build with In Progress status. Admin exposes these fields; uncheck the old current build before selecting another. The hero uses that selection, or falls back to the first published In Progress project. Keep it visible in the Projects section even under featured-only filtering. Initial project notes/bullets are maintained in `supabase/project-journals.json` for the developer-only seed generator; runtime content still comes solely from Supabase.

Warm ivory #f6f5ef, charcoal #22241f, muted olive, soft yellow/sage project illustrations. Dark theme uses the same hierarchy. Arial/Helvetica body and Georgia editorial italic avoid blocking network font requests. Arch-cropped portrait; asymmetrical project grid; timeline-like experience rows; generous section spacing; substantial dark footer. Subtle Motion reveals honor reduced motion. Use restrained section gradients as requested by the owner; avoid glowing effects and glass dashboard styling. Mobile breakpoint 680px, intermediate 1000px. Project illustrations are symbolic artwork, never pretend screenshots. Theme setting persists in localStorage.

## Deployment

Create Supabase → run all four migrations in order once → disable signups → create Auth user → allowlist UUID → upload initial portrait and resume to their private buckets → configure env → verify locally → create/push GitHub repo → import into Vercel → configure production env/domain → verify live. For existing databases, run only unapplied migrations. README provides exact instructions. The owner created `https://github.com/rohitkumaryadav1/Portfolio.git`, and it is configured as origin. Supabase and Vercel production setup remain pending.

## Implemented features

Public home/about/projects/details/experience/skills/education/contact/large footer; private admin overview and CRUD for content; publish/order/feature/visibility controls; profile/cover/screenshot preview/upload/replace/remove; server login/logout; database and Storage policies; metadata, sitemap, robots, loading/error handling and responsive light/dark design. Two experiences and three projects are seeded from supplied material. Interests remain empty/unpublished.

## Verification and work in progress

GitHub publishing completed: source was pushed to `https://github.com/rohitkumaryadav1/Portfolio` on `main`; the initial implementation commit is `4d175a8e5467a2ec347c1c6d38c1f4847c465ba9`, verified against the remote branch. The latest production build and all nine tests pass. Actual environment files, passwords, generated PDF workers, dependencies, and build output are excluded. `SETUP-NEXT.md` is the owner's short Supabase/Auth/Vercel checklist. Supabase and production hosting are still pending; no administrator account/password exists. The owner will enter the password privately when creating the Supabase Auth user. Do not invent a default password or implement an authentication bypass.

Latest revision: nine tests and HTTP smoke checks pass, including four migrations, journal upgrades/current-build constraints, private PDF reference replacement/removal, executable PDF rejection, and a same-origin helper that compares the actual Host header (fixing localhost/127.0.0.1 aliases). Browser verified spherical drag/wheel/control zoom, Delhi location, mesh pause, hero/listing dialogs, larger text, and a rendered PDF.js resume with zoom. Desktop/mobile have no measured horizontal overflow. OS reduced-motion emulation was not performed; defaults are implemented. See `docs/verification.md` for scope and hosted-account limitations.

Content validation tests and real PostgreSQL (PGlite) migration/RLS tests pass. Tests cover schema/seed validation, singleton admin enforcement, unauthorized writes, create/edit/publish/unpublish/delete for projects/experiences, and profile image reference replacement/removal. Auth/Storage schemas are stubbed only in the disposable test database; hosted Supabase is still unconfigured. Production build passes; final checks and browser QA results are recorded in `docs/verification.md`.

Remaining account-dependent work: Supabase project creation, hosted Auth/Storage and complete browser admin flow verification, GitHub remote and push, Vercel deployment. Do not claim any account is connected or the product is fully verified until those steps are observed. Do not ship visual QA fixture credentials; the test server is not a database/backend.

The local Git repository uses `main`, with origin set to `https://github.com/rohitkumaryadav1/Portfolio.git`. The owner explicitly authorized pushing the full project source. Keep credentials and actual environment files out of commits. The initial production build passes. The additional production-preview launch was blocked by automatic approval review (“blocked by policy”); browser visual QA was performed in development mode. After the compact-layout revision, a local preview is intentionally left running at `http://127.0.0.1:3000` for the user's requested direct link, backed only by the isolated read-only fixture server on port 54399. This is not hosted Supabase or a public deployment. These processes may need restarting in a later session.

## Known issues and limits

The resume does not supply stacks, dates, repos, or demos for the first two projects. Leave them blank. Metrics are resume-reported rather than independently audited. Month-only dates use day 01 internally. Mail Trace Monitor source at `G:/mail-trace-monitor` uses temporary/local endpoints and is In Progress. Project/source must not be modified as part of portfolio work. Photo removal keeps unreferenced private objects until manual cleanup. No custom password-recovery UI; use Supabase dashboard. Public profile unpublishing intentionally makes the main page unavailable. Public title/tagline/section labels are art-directed code; personal portfolio content is database-managed.

## Future enhancements

The requested interactive spherical globe is implemented with Canvas/D3. Optional future work: WebGL material effects, a carefully scoped server chatbot, unused-upload cleanup, richer project ordering UI, and independently verified evaluation notes for resume metrics. No chatbot UI is included.

## Important decisions and source provenance

User-provided resume `G:/ROHIT_Portfolio/Rohit_resume_.pdf` was fully extracted and visually inspected. No “Rohit Resume” directory was supplied; user confirmed the PDF path. Mail Trace Monitor backend models, tracking/analytics routes, extension source, and manifest were inspected without opening its `.env`. Yellow hoodie photo was explicitly authorized. Existing source/resume preserved. Flexible JSONB content reduces CMS duplication while retaining publication/index/ownership boundaries in relational columns. No placeholder experience, invented hobby, imaginary portrait, or fake project screenshot.
