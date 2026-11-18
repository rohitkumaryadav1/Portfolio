# Verification record — 18 November 2026

## Section separation and stronger mesh revision

The production build and all nine tests pass for this revision. Initial implementation commit `4d175a8e5467a2ec347c1c6d38c1f4847c465ba9` was pushed to the owner-provided GitHub repository and verified against `origin/main`. No actual environment file or credential was included. Hosted Supabase and Vercel remain unconfigured.

The resume navigation now has a bold boxed treatment. Experience, Projects, Skills, and Education have distinct sage/sand/blue/cream gradient surfaces and borders, with dedicated dark-mode colors. The mesh has stronger tidal displacement, cursor-centered ripples, and sparse floating points, with pause and reduced-motion behavior retained. Desktop and 375px mobile browser checks found no horizontal overflow; resume weight measured 700. The four main panels have distinct computed background gradients. Fixture-mode admin login now explicitly states that no account/password has been created; it exposes no login bypass.

## Interactive presentation and resume revision

- Completed shared project cards/journals, source-grounded Mail Trace Monitor notes, bullet points, optional blog/GitHub/YouTube/live links, admin fields, backward-compatible payload defaults, and the single-current-build migration. Native dialogs were checked from both hero and Projects, including Escape/close, body scroll lock, focus restoration, and mobile overflow.
- Added the footer globe, mouse drag, mouse-wheel zoom, zoom/pause/location buttons, keyboard controls, and Delhi city marker. Browser checks confirmed rotation changed from `-77.2,-28.6` to `-50.2,-15.1` after dragging and zoom changed from `1.00` to `1.15` via controls, with wheel zoom bounded at `1.55`. The date/body/eyebrow text measured 16px/16px/12px on desktop. The date column is narrower. The cursor-responsive mesh has a working pause toggle.
- Added private resume storage, PDF upload validation, preview/replacement/removal fields, and dynamic open/download routes. The initial public PDF was rendered and checked, and its phone number removed while preserving the original. Native PDF viewing was blank in the in-app browser, so `/resume` now uses a dedicated PDF.js viewer; actual page rendering, zoom, download link, accessible text alternative, and no browser console errors were verified. `/api/resume` returns PDF bytes with inline/attachment headers as requested.
- Nine automated tests pass, including the actual four PostgreSQL migrations, legacy project journal upgrade, current-build constraints, RLS for replacing/removing resume references, unauthorized document uploads, invalid/executable PDF rejection, safe resume paths, and same-origin checks with local host aliases. HTTP smoke checks pass for public pages, missing projects, anonymous API rejection, foreign-origin rejection, and PDF headers/bytes.
- Final production build passes with the globe, mesh, PDF.js viewer/worker, resume APIs, and all project changes. The local development preview was restarted afterwards and HTTP smoke checks passed again. Hosted production runtime remains unverified until deployment.
- Browser checks at 1440px and 375px found no horizontal overflow. The project dialog also fits at 375px. Globe and mesh honor reduced-motion defaults and have user pause controls; OS-level preference emulation was not performed.
- Hosted Supabase Auth/Storage uploads and persistence remain account-dependent and unverified. The running localhost preview uses isolated read-only fixtures; it is not a public deployment or a functional substitute for Supabase.

Latest screenshots: `screenshots/revised-home.jpg`, `screenshots/interactive-footer-final.jpg`, `screenshots/mobile-project-journal.jpg`, `screenshots/interactive-mobile-footer.jpg`, and `screenshots/resume-viewer.jpg`.

## Compact-layout revision

Portrait reduced to 320px desktop / 220px mobile. Hero typography and spacing reduced. Experience now immediately follows the introduction, followed by Projects and About. Navigation and section numbers updated. Hero Contact me links directly to email; the new bordered scroll link targets Experience.

TypeScript check passes. Browser checks at 1280px and 375px confirm no horizontal overflow, the expected portrait sizes, the email mailto target, and section order. Clicking Scroll to experience brings the section to the 90px scroll offset. Screenshots: `screenshots/compact-desktop.jpg` and `screenshots/compact-mobile.jpg`. A local fixture-backed preview is left running at http://127.0.0.1:3000 for the user's direct-link request; it is not a public deployment.

## Passed locally

- Strict TypeScript validation and Next.js production build.
- Final production build completed after the last application changes. Starting a separate production preview was rejected by automatic approval review with only “blocked by policy”; production-runtime preview remains unverified. Browser checks used development mode.
- Five automated tests: safe table/URL validation; date/media-path validation; publication/order validation; in-progress project support; actual PostgreSQL migrations/seed/RLS integration.
- PostgreSQL integration checks use PGlite with minimal Supabase Auth/Storage schema stubs. Both shipped migrations execute unchanged. Every seed row validates against its Zod schema. Administrator create/edit/publish/unpublish/delete succeeds for projects and experiences; anonymous readers cannot see drafts; anonymous/non-admin writes fail; a second administrator cannot be inserted; profile image replacement/removal changes anonymous media visibility.
- HTTP checks against the real Next.js app with isolated read-only seed fixtures: homepage and project detail render; `/admin` returns a 307 redirect to `/admin/login`; anonymous mutation/upload requests return 401; foreign-origin requests return 403; missing projects render not-found UI and `noindex` (Next.js may stream these with already-sent 200 headers).
- Browser inspection at 1440px desktop, 768px tablet, and 375px mobile. No horizontal overflow in measured viewports. Supplied portrait loads. Mobile hero typography adjusted to avoid an oversized extra line. Theme toggle, project navigation, contact section, and unauthorized admin redirect checked. Public page has zero admin links.
- Source scan found no embedded service-role credential, actual `.env` file, public phone number, or encoding corruption. Original resume and Mail Trace Monitor source were preserved.

## Scope of visual QA

`tests/preview-server.mjs` provided reviewed seed fixtures through a minimal read-only HTTP shape for the actual Next.js public pages. It does not implement authentication, writes, or persistence. Screenshots in this folder document the public visual result and real admin login UI; they are not evidence of a connected Supabase account or successful authenticated dashboard session.

## Account-dependent checks still required

- Create and configure the hosted Supabase project.
- Verify real email/password login, session refresh/expiry/logout, and rejection of a different account.
- Run the full browser admin CRUD/publication checklist against hosted Supabase, including reload persistence.
- Upload/replace/remove real images through Supabase Storage HTTP APIs and confirm public visibility.
- Create/push the GitHub repository and deploy to Vercel. Verify final production domain, environment variables, metadata, and access boundaries.

Follow the numbered setup and verification steps in README.md. The owner-provided GitHub repository is configured as origin. Hosted Supabase and production deployment are still pending.

## Hosted Supabase checkpoint — 18 November 2026

All four checked-in migrations were applied to project `soetxwrjrhztzloqtmpo` through the owner's signed-in SQL Editor. No database password or secret key was used. Public signups were disabled; email authentication remains enabled. The real URL and supplied publishable key are configured only in ignored `.env.local`.

`node --env-file=.env.local scripts/verify-supabase.mjs` passes: seven content tables return only published rows (1 profile, 3 projects, 2 experiences, 34 skills, 1 education, 0 interests, 1 settings), anonymous `is_admin()` is false, and anonymous allowlist reads are denied. Local HTTP checks against the real project: homepage 200 with reviewed content, `/admin` 307 to login, unauthenticated project mutation 401. Nine regression tests pass.

Outstanding: owner password entry/account creation, allowlisting, initial image/PDF uploads, and authenticated hosted CRUD/upload checks. Brave's extension rejected the initial file chooser upload because file-URL access is disabled; the owner received instructions. No upload success or complete admin verification is claimed.

## Production deployment and authenticated verification

Live URL: https://rohit-kumar-yadav-portfolio.vercel.app. Vercel initial deployment `dpl_5wiAo7jHF6swAmsAow2kvYuBvhnv` succeeded from GitHub commit 938b884. Owner-created email account is the sole allowlisted admin following explicit approval. Public signups remain disabled. Supabase Auth Site URL matches production.

Authenticated login succeeded locally and on production. Uploaded the real supplied portrait and sanitized resume through app upload endpoints, saved profile, and verified published responses: WebP 200 (234404 bytes), PDF inline/download 200 (116484 bytes). The portrait rendered after scrolling into its lazy-load area. Projects: create draft, verify anonymous exclusion, edit and publish, observe live website, unpublish and verify public removal, delete test record. Experiences: create draft, observe it in production admin after refresh, edit/publish on production, verify public appearance, unpublish and verify public removal, delete. Final dashboard returns original 3 projects / 2 experiences / 34 skills. Temporary records are gone.

Production HTTP: homepage 200, /admin anonymous redirect 307, project/upload/resume anonymous mutations 401, foreign-origin mutation 403, inline and downloadable resume 200, sitemap and robots 200. No horizontal overflow measured in the current browser viewport. Prior desktop/mobile visual checks apply to unchanged application code. Image replacement/removal RLS coverage remains database-tested rather than a repeated production browser cycle. Production screenshots: live-portfolio.jpg, live-footer.jpg, production-admin-overview.jpg, vercel-production-deployed.jpg.

Production logout returned to /admin/login; the delivered admin tab is logged out.
