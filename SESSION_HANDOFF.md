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
- **Content:** posts (`classes/{c}/posts`, embedded `links` array) + Reddit-style threaded comments (`.../posts/{p}/comments`, `ancestorIds` path, depth 5). Timestamps everywhere; soft deletes on users, posts, comments. No file uploads (links to external apps). No upvotes in v1. No email blast in v1 (`mailto:` BCC / EmailJS later); SMS has no free path (Remind/GroupMe link).
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

**Last updated:** 2026-10-15

### Last session

**2026-10-15 (session 4) — Phase 2b (per-class roles), Phase 3 (board + posts), Phase 4 (threaded comments), Phase 5 (admin panel)**

- **All built, deployed (rules + indexes) and passing checks — but NOT manually tested yet.** The user has only tested adding themselves to a class. Next session starts with a local testing checklist for the user.
- **Phase 2b:** rewrote `firestore.rules` (super admin, `canIn` via member → class role, rank checks, no escalation, join requests, invites with `createdBy`/`createdInClassId`, member phone copy). Sign-up class picker + `/pending` request/cancel. Admin: class switcher, class **Students** (roster with phones, approve/reject join requests, invite new account, change role, remove), class **Roles** editor (rank, color, permission checkboxes), super admin **All classes** / **All users**. New classes start with only a **Student** role.
- **Super admin joins a class** via **Add existing user** on a class's Students page (super admin only; copies the phone from `userContacts`; rule allows that phone source).
- **Production migration done (with OK):** `admins/lWLOvCyPTPeAazxpfMrRCKlM9ik2` created; Kynt's user doc cleaned (`roleIds`/`permissions` removed, `createdBy`/`createdInClassId` null); global `roles/*` deleted.
- **Phase 3:** `board-layout` (top bar, class switcher, user menu), routes under `/classes/:classId` (feed, `posts/new`, `posts/:postId`, `posts/:postId/edit`), feed pinned-first with "load more" by 20 + title search, right sidebar (class info, pinned links), post create/edit/soft delete/pin, archived classes read-only. Links render http(s) only. `docData` now uses estimated server timestamps.
- **Phase 4:** comments with `parentId` + `ancestorIds` (rules enforce parent chain + depth ≤ 5), reply/edit/delete, collapse threads, "[deleted]" placeholders (deleted text stays private), counts via `count()` on feed cards.
- **Phase 5:** admin dashboards (super admin `/admin`: open classes, active/deactivated users, pending join requests, class list; class overview: members, join requests, posts, deleted posts — all `count()`), breadcrumbs + class-aware "Open board" in the admin header, **Moderation** page (all/live/deleted posts, delete/restore, expand for comments with delete/restore), roster row selection + **Email selected** (mailto BCC / copy), super admin **user page** `/admin/users/:userId`. Deployed rules (super admin collection-group reads of posts/comments) + indexes. Data-table upgrade skipped. Renamed `useMyMemberships`/`useMyJoinRequests` → `useMembershipsOf`/`useJoinRequestsOf`.
- Tests: 63 passing. Shadcn `dropdown-menu` + `textarea` added (imports fixed).

**2026-10-08 (session 3) — Planning, then Phase 1 (auth) and Phase 2 (rules, roles, admin panel)**

- **Phase 1 done + tested:** stepper sign-up, login/logout/forgot password, `/pending`, route guards. Verified with `ktabudlong@student.ccc.edu`.
- **Phase 2 built:** full `firestore.rules` for `users` / `userContacts` / `classes` / `roles` (deployed); roles seeded; that account is now the first admin. Lazy-loaded admin panel at `/#/admin` (`admin-layout`, sidebar filtered by permission) with a **classes table** (add/edit/archive) and a **users table** (search by first/last name, status filter, add user via second app instance + set-password email, edit, approve, assign classes/roles, deactivate/restore). Student role can create posts (user's choice). Firestore hooks `use-document` / `use-collection`; plain logic in `src/lib/` with Vitest tests (30 passing).
- **Admin landing:** users with admin permissions land on `/admin` after login; the admin header's "Open board" opens `/` in a new tab. User chose to keep hash URLs.
- **Class is the anchor (user decision):** `classes/{classId}/members/{uid}` pivot (one doc per person per class) replaces `users.classIds`; **roles are per class** (on the membership, class permissions only) and `users.roleIds` are **app-wide roles** (apply in every class + admin panel); posts/comments will live at `classes/{classId}/posts/{postId}/comments/{id}`. Pending = no memberships and no app-wide roles. New: `use-memberships` (collection-group queries), `lib/memberships` (pivot diff), `class-roles-field`, `canIn()` in auth context.
- **Per-class roles DESIGNED, NOT BUILT** (end of session; plan § Data model, § Authorization rules, § Admin panel): super admin (`admins/{uid}`) → class → **class-owned ranked roles** (`classes/{c}/roles`, one role per member, no permission copies); class permissions `admin.access`, `students.view`, `students.manage`, `roles.manage` + content; officers get a class-scoped admin panel (class switcher); students **pick their class at sign-up** (join request) and officers approve; officers can also create accounts; `users.createdBy` (null = self sign-up) and `members.addedBy`; **all classmates see phones** (copy on each membership). New classes start with Student + President.
- **Not done:** the per-class roles build (ROADMAP Phase 2b). The interim model (global `roles`, `members.roleIds` + `permissions`, app-wide `users.roleIds`) is what's deployed. The user's manual `/admin` test is deferred until 2b. Posts/comments rules arrive with Phases 3–4. Admin-header breadcrumbs moved to Phase 5.

- **Data model decided** (plan § Data model): `classes`, `roles/{slug}` (master table; permissions are code constants stored per role), `users/{uid}` (`classIds[]`, `roleIds[]`, derived `permissions[]`), private `userContacts/{uid}` (E.164 phone + SMS opt-in; separate doc because rules are per document), `posts` (`classId`, `userId`, embedded `links[{url,label}]`, `pinned`), `posts/{id}/comments` (threaded via `parentId`). camelCase fields; `createdAt`/`updatedAt` server timestamps; soft delete = `deletedAt` written as `null` on create. Author names joined client-side (no `authorName` copies); comment counts via `count()`.
- **User decisions:** users can be in many classes; self-signed-up users are **pending** until an admin assigns class + roles; threaded comments kept; links embedded; **upvotes after launch**; app must stay a **single-page app**.
- **Accounts (plan § Account creation):** **stepper sign-up** (account → verify email → profile → done; step derived from account state). Admins can also **create accounts directly** from the users table: second Firebase app instance + random hidden temp password + `sendPasswordResetEmail` as the "set your password" invite. User delete = soft delete (client can't delete others' Auth logins). Permissions `users.view` (table + contacts) and `users.manage` (CRUD/approve/assign); `users.manage` can only grant permissions it holds. **Users table (search by first/last name) + classes CRUD moved to Phase 2**; posts now Phase 3 (days 11–14).
- **UI:** Reddit-style student board (`board-layout`, class switcher, right sidebar, comment thread lines) + CRM-style admin panel (`admin-layout`, lazy-loaded, sidebar, dashboard, `@tanstack/react-table` data tables with filters/bulk actions, detail pages, moderation/restore). Phase 5 grew to days 16–21; launch ~4 weeks.
- **Rules/tooling:** new `.cursor/rules/react-standards.mdc` (SOLID in React terms, layers, SPA navigation); `GENERAL.mdc` gained SPA + MCP notes. `.cursor/mcp.json` adds the official **Firebase MCP** (`--only auth,firestore`) — points at production, ask before writes. Not yet signed in / project not selected.
- Email burst: `mailto:` BCC / EmailJS later. SMS: no free path (Twilio needs server + A2P 10DLC; carrier gateways closing) → link to Remind/GroupMe.

### Resume here

1. **The user runs the local testing checklist** (Phases 2b–5, given in chat 2026-10-15; same areas as the "(User) Manual test" items in `ROADMAP.md`); fix what they find.
2. (User) Commit on `dev`; merge `dev` → `main` when happy (the live site still runs the pre-2b code).
3. **Phase 6** — emulator + rules tests, mobile/accessibility pass, invite the class.
4. Main bundle is ~976 kB (Firebase SDK + board); the admin panel is split out. Revisit chunking if load time matters.

### Caveats

- GitHub Pages has no server rewrites → use a **hash router** (`/#/posts/123`).
- Firebase web config is not secret: committed in `.env.production` for builds; `.env.local` (gitignored) for local dev. No GitHub repository variables needed.
- `ktabudlong.github.io` is already in Firebase Auth **authorized domains**; add any future custom domain there too (and change Vite `base` to `/`).
- `npx shadcn add …` writes `import { cn } from "cn"` (TS 6 has no `baseUrl`) — fix to `@/lib/utils` after each add.
- Laragon's `.test` URL won't work for this project; always use `npm run dev`.
- Firebase MCP has no emulator behind it yet — every write hits **production**. Ask the user first.
- **Super admins** are created by hand: `admins/{uid}` `{ createdAt }` (console or MCP with the user's OK).
- Invites create the Auth login first, then a Firestore batch; if the batch fails the login exists without a profile (the student can still finish sign-up normally).
- Firebase MCP read-back quirk: `firestore_update_document` / `firestore_get_document` error on fields that are `null` (e.g. `deletedAt`) even when the write succeeded. Pass a `mask` that skips null fields when reading.
