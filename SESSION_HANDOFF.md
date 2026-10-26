# Session Handoff

**How you use this file**

- **Session start:** You say something like **"read session handoff"**. The agent follows **§ Permanent: start session** below, then reads **§ Continuity** and the other docs listed there.
- **Session end:** You say something like **"update session handoff with all our changes this session"**. The agent follows **§ Permanent: end session** (update files, time log, continuity—not a diary of every line of code).

**What lives where**

- **`SESSION_HANDOFF.md`** — permanent start/end procedures + **§ Continuity** (short "where we left off").
- **`ROADMAP.md`** — internal planning, **§ Short-term checklist**, **Current milestone**.
- **`WORK_SESSIONS.md`** — time log (one row per session).
- **`.cursor/plans/mxc_respi_announcements.plan.md`** — the full build plan (stack + versions, data model, rules, routes, structure, timeline). Source of truth for *how* to build.

---

## Permanent: start session

*Run this when the user opens a session and asks you to read the handoff (or equivalent).*

1. **Time log — start:** In **`WORK_SESSIONS.md`**, ensure **today's** row exists for this session: set **Start (CST)** from the **first message** of the chat (24h, Central). If the row is new, use **—** for **End** and **Total** until the session closes.
2. **Read this file** top to bottom: **§ Permanent: start session** (this block), **§ Permanent: end session** (skim so you know the close-out contract), then **§ Continuity**.
3. **Planning / todos:** Open **`ROADMAP.md`** — at least **§ Short-term checklist**, **Current milestone**, and **§ Blocked / waiting**. Adjust nothing unless the user already asked you to; just be aligned.
4. **Build plan:** For implementation work, read the relevant sections of **`.cursor/plans/mxc_respi_announcements.plan.md`**.
5. **Before coding:** Project rules first (**`.cursor/rules/GENERAL.mdc`**). These override the Laravel-focused global User rules for this repo (no Laravel here).
6. **While coding:** Run **`npm run lint`**, **`npm run format`**, **`npm run types:check`**, and **`npm test`** after substantive TS/TSX edits. Run **`npm run build`** before declaring a deploy-related change done.

---

## Permanent: context & rules

### Project (one minute)

- Announcement board for the **Respiratory Therapy class at Malcolm X College** (City Colleges of Chicago).
- **Frontend only**, hosted free on **GitHub Pages**. Backend = **Firebase Spark (free) plan**: Auth (email/password + email verification) + Firestore.
- **Must stay free:** no Blaze plan, no Cloud Functions, no Firebase Storage. No credit card on the Firebase project.
- **Sign-up restricted** to `@student.ccc.edu` (students) and `@ccc.edu` (instructors), case-insensitive, enforced in UI **and** `firestore.rules`.
- **Single-page app** with two looks: **Reddit-style student board** (`/`) and **CRM-style admin panel** (`/admin/*`, lazy-loaded).
- **Classes are the anchor:** all class data lives under `classes/{classId}` (members pivot, roles, join requests, posts, comments). Users can be in many classes; new users pick a class at sign-up and stay **pending** until someone with `students.manage` approves.
- **Roles:** super admin (`admins/{uid}`) → class → each class's **own ranked roles** (`classes/{c}/roles`, one role per member). "Officers" are just roles with admin permissions. You only manage roles/people ranked below you and only grant permissions you hold.
- **Content:** posts (`classes/{c}/posts`, rich HTML + ≤3 photos as Firestore bytes, embedded `links`) + threaded comments + votes (`…/votes/{uid}`, score on the post/comment). Soft deletes on users, posts, comments. Roster email (`mailto:` BCC) + text (`sms:` links) behind `students.message`.
- **Data model** is fixed in the plan § Data model (decided 2026-10-08) — read it before touching Firestore code.
- **Security model:** `firestore.rules` is the backend contract (like Laravel policies + Form Requests). Never rely on UI checks alone.

### Stack (pinned in plan)

- React 19.3, Vite 8.3, **TypeScript 6.0.3** (not 7.x — `typescript-eslint` supports `<6.1`), react-router 8.4 (hash router), firebase 12.19, Tailwind 4.3, shadcn/ui (`new-york`, `neutral`), Vitest 5.0, firebase-tools 15.32.
- Tooling mirrors **`c:\laragon\www\ih_planner`**: same ESLint flat config + Prettier (single quotes, 4 spaces, tailwind plugin), kebab-case filenames, `@/` → `src/`.

### Local environment (Windows, Laragon folder)

- Node 24.19 installed. `winget` available. **Java not installed** — Firebase emulator deferred to Phase 6 (`winget install EclipseAdoptium.Temurin.21.JDK`).
- GitHub CLI (`gh`) not installed.
- Repo `KTabudlong/mcx_respiratory`. **`main`** = default branch + production (push to `main` deploys to Pages); **`dev`** = development/testing. User commits/pushes and merges `dev` → `main` at milestones.
- The project sits in Laragon's `www/` but isn't served by Laragon — use `npm run dev` (`http://localhost:5173/mcx_respiratory/`).
- Until Phase 6, develop against the **real** Firebase Spark project (well within free quota).

### User background

- Strong: React, JavaScript, MySQL. So-so: TypeScript. New: Firestore / NoSQL. Keep TS light; explain Firestore in MySQL terms when helpful.

---

## Permanent: end session

*Run this when the user asks you to **update the session handoff** with the session's changes (or explicitly to close out the session).*

1. **§ Continuity (this file):** Set **Last updated** to today. Replace **§ Last session** with a **short** summary of what changed (themes, decisions, what's incomplete). Fill **§ Resume here** for the next chat. Keep it brief—**`ROADMAP.md`** owns the checklist.
2. **`ROADMAP.md`:** If you **planned** or reprioritized: bump **Planning last reviewed**, edit **Current milestone**, add/remove/check **§ Short-term checklist**. If only code shipped, tick completed tasks.
3. **Build plan:** If decisions changed the plan, update **`.cursor/plans/mxc_respi_announcements.plan.md`** too.
4. **Time log — end:** In **`WORK_SESSIONS.md`**, complete **today's** row: **End (CST)** (24h), **Total** (`Hh Mm`), **Notes** (one-line summary).
5. **Quality:** Note failing lint/types/build or follow-ups in **§ Continuity** or **`ROADMAP.md` § Blocked / waiting**.

---

## Continuity (rolling — agent updates on end session)

**Last updated:** 2026-10-26

### Last session

**2026-10-26 (session 8) — section 10 steps 1–5 pass; admin-panel polish from feedback**

- **Tested (test project):** 2026-10-22 changes, Class A overview, sidebar persistence, Moderation, comments-only role — all pass after the fixes below. 2026-10-22 commit pushed on `dev` by the user.
- **Built (checks + build green, 111 tests):**
  - **Why pending** under the Pending badge (All users + user page): join request / invite not accepted / class request / nothing (`lib/pending-reasons.ts`). **Rules:** super admins may list every class's invites (collection group) — deployed to **test only**.
  - **Buttons:** shared icon-only `DeleteButton` (red, trash) / `RestoreButton` (green) in `components/common/action-buttons.tsx`, word in `title` + `aria-label`; used app-wide (moderation, board comments, roles, restore account).
  - **Moderation:** search matches title, text **and comments** (moderators; `useClassComments` = one listener per post while searching, tombstones matched on archived text); matched posts open with only the matching threads (+ "Show all"); comments in thread order; sortable headers asc → desc → none (`lib/table-sort.ts`, `SortableHead`, `?sort=&dir=`); `lib/moderation.ts` holds the logic. Opens for any of `MODERATION_PERMISSIONS` (delete posts / edit posts / pin / delete comments) with per-row actions (pencil, pin, delete/restore, comments).
  - **Admin edit page** `/admin/classes/:classId/moderation/:postId` (shared `PostEditor` with the board's edit page); Cancel / Save return to Moderation with filter + sort; breadcrumb shows the post title; sidebar highlights nested pages.
  - **Board:** moderators restore "[deleted]" comments in place (`CommentNode.tombstone`).
- **Opinion given:** edit / pin implying read of live posts is standard (deleted content stays behind delete permissions). Optional idea not built: hint on the Roles page that edit / pin also opens Moderation.

**2026-10-22 (session 7)** — dashboard cards open pre-filtered pages (filters / tabs in the URL), Classes tabs Active / Archived / Requests + join-requests column, Active users card matches the filter.

**2026-10-21 (session 6)** — test project `mcx-respiratory-test` + Mailtrap (super admin `superadmin@student.ccc.edu`; test accounts: Class A pres / treas / mod / stu1–3 / co-officers, Class B requester + prof, newbie pending). Built: optional class at sign-up, toasts, admin account menu, post edit history, comment tombstones, comment sort. **Those rules are on the test project only** (ROADMAP § Blocked).

### Resume here

1. **User (test project, `npm run dev`), one step at a time:** section 10 **step 6 — email / text** (Treasurer without / with "Email and text selected students": checkboxes, header checkbox, Clear, Email (BCC), Copy addresses, Text selected lists only opted-in members with phones, Copy numbers / message, Open in Messages on Android), then **step 7 — super admin user page** (profile, phone, classes, recent posts, "Deleted" badges, pending reasons), then **section 11 — archive** Class A (board read-only: no posting / editing / voting, scores still show; pending invites to Class A disappear). Full checklist: 2026-10-21 chat ([Test project and feedback fixes](be64807d-4e1e-485a-9864-7b5cb0dd332d)). Fix what breaks.
2. **Merge day:** user commits on `dev` and merges `dev` → `main`; agent deploys rules + indexes to production in the same step (`npx -y firebase-tools@latest deploy --only firestore --project default`, needs the user's approval). Includes the 2026-10-21 rules and the 2026-10-26 invites rule.
3. Next build candidates: super admin name/phone edit + change log; email delivery decision (EmailJS vs `mailto:`).
4. Optional: backfill `score: 0` on pre-vote posts so **Top** includes them.
5. **Phase 6** — Java + emulator rules tests (cover invites, notifications, edit history, tombstones), mobile/accessibility pass, invite the class.

### Caveats

- GitHub Pages has no server rewrites → use a **hash router** (`/#/posts/123`).
- Firebase web config is not secret: committed in `.env.production` for builds; `.env.local` (gitignored) for local dev. No GitHub repository variables needed.
- `ktabudlong.github.io` is already in Firebase Auth **authorized domains**; add any future custom domain there too (and change Vite `base` to `/`).
- `npx shadcn add …` writes `import { cn } from "cn"` (TS 6 has no `baseUrl`) — fix to `@/lib/utils` after each add.
- Laragon's `.test` URL won't work for this project; always use `npm run dev`.
- **Two Firebase projects (2026-10-21):** `mcx-respiratory` = live (`.env.production`, `.firebaserc` default). `mcx-respiratory-test` = testing (`.env.local`, alias `test`); its Auth emails go through **Mailtrap** SMTP (set in the console, Authentication → Templates → SMTP), so fake `@student.ccc.edu` accounts work. Deploy rules/indexes to **both**: `npx -y firebase-tools@latest deploy --only firestore --project test` and `--project default`. Restart `npm run dev` after changing `.env.local`.
- Firebase MCP has no emulator behind it yet, and it targets the `.firebaserc` **default (live)** project — every write hits **production**. Ask the user first; for the test project use the CLI with `--project test`.
- **First** super admin is created by hand (`admins/{uid}` `{ createdAt }`); after that, promote/remove from `/admin/users/:userId` (can't remove yourself).
- Invites create the Auth login first, then a Firestore batch; if the batch fails the login exists without a profile (the student can still finish sign-up normally).
- Notification rules add `exists`/`getAfter` calls to heavy batches (Firestore limit 20 per batch). If approve / invite / President-class creation fails with permission-denied, check that first.
- Auto-review asks the user to approve every rules deploy, even to the test project.
- Firebase MCP read-back quirk: `firestore_update_document` / `firestore_get_document` error on fields that are `null` (e.g. `deletedAt`) even when the write succeeded. Pass a `mask` that skips null fields when reading.
