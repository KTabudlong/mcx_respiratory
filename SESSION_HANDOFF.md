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
- **Classes:** users can belong to many classes (`classIds`). New users sign up **pending** (no classes/roles) until an admin assigns them.
- **Roles:** custom roles (admin-defined, `roles/{slug}` master collection, no enums), a user can hold many (`roleIds`). Seed Admin / Moderator / Student. Users store a derived `permissions` array so rules can check it.
- **Content:** posts (one class + one author, embedded `links` array) + Reddit-style threaded comments. Timestamps everywhere; soft deletes on users, posts, comments. No file uploads (links to external apps). No upvotes in v1. No email blast in v1 (`mailto:` BCC / EmailJS later); SMS has no free path (Remind/GroupMe link).
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

**Last updated:** 2026-10-08

### Last session

**2026-10-08 (session 3) — Planning only: data model, two-UI design, React rules, Firebase MCP (no app code)**

- **Data model decided** (plan § Data model): `classes`, `roles/{slug}` (master table; permissions are code constants stored per role), `users/{uid}` (`classIds[]`, `roleIds[]`, derived `permissions[]`), private `userContacts/{uid}` (E.164 phone + SMS opt-in; separate doc because rules are per document), `posts` (`classId`, `userId`, embedded `links[{url,label}]`, `pinned`), `posts/{id}/comments` (threaded via `parentId`). camelCase fields; `createdAt`/`updatedAt` server timestamps; soft delete = `deletedAt` written as `null` on create. Author names joined client-side (no `authorName` copies); comment counts via `count()`.
- **User decisions:** users can be in many classes; self-signed-up users are **pending** until an admin assigns class + roles; threaded comments kept; links embedded; **upvotes after launch**; app must stay a **single-page app**.
- **Accounts (plan § Account creation):** **stepper sign-up** (account → verify email → profile → done; step derived from account state). Admins can also **create accounts directly** from the users table: second Firebase app instance + random hidden temp password + `sendPasswordResetEmail` as the "set your password" invite. User delete = soft delete (client can't delete others' Auth logins). Permissions `users.view` (table + contacts) and `users.manage` (CRUD/approve/assign); `users.manage` can only grant permissions it holds. **Users table (search by first/last name) + classes CRUD moved to Phase 2**; posts now Phase 3 (days 11–14).
- **UI:** Reddit-style student board (`board-layout`, class switcher, right sidebar, comment thread lines) + CRM-style admin panel (`admin-layout`, lazy-loaded, sidebar, dashboard, `@tanstack/react-table` data tables with filters/bulk actions, detail pages, moderation/restore). Phase 5 grew to days 16–21; launch ~4 weeks.
- **Rules/tooling:** new `.cursor/rules/react-standards.mdc` (SOLID in React terms, layers, SPA navigation); `GENERAL.mdc` gained SPA + MCP notes. `.cursor/mcp.json` adds the official **Firebase MCP** (`--only auth,firestore`) — points at production, ask before writes. Not yet signed in / project not selected.
- Email burst: `mailto:` BCC / EmailJS later. SMS: no free path (Twilio needs server + A2P 10DLC; carrier gateways closing) → link to Remind/GroupMe.

### Resume here

1. (User) Commit on `dev`. Optional: delete the 5 unused env variables under GitHub **Settings → Environments → github-pages**.
2. **Phase 1 code is done and the Phase 1 rules are deployed** (Firebase MCP signed in as `laotabudlong@gmail.com`, active project `mcx-respiratory`). Manual test passed with `ktabudlong@student.ccc.edu` (verification email delivered, profile saved, `/pending` shown). That account is the planned first admin.
3. **Phase 2:** full `firestore.rules` (`isMember`, `isActive`, `can()`, `users.view`/`users.manage`, no privilege escalation), seed roles, first-admin steps, lazy-loaded admin shell, classes table, users table (search by first/last name, admin-created accounts via second app instance + set-password email, approve pending, soft delete/restore).
4. Bundle is ~923 kB (Firestore SDK + auth screens); admin panel will be lazy-loaded starting Phase 2.

### Caveats

- GitHub Pages has no server rewrites → use a **hash router** (`/#/posts/123`).
- Firebase web config is not secret: committed in `.env.production` for builds; `.env.local` (gitignored) for local dev. No GitHub repository variables needed.
- `ktabudlong.github.io` is already in Firebase Auth **authorized domains**; add any future custom domain there too (and change Vite `base` to `/`).
- `npx shadcn add …` writes `import { cn } from "cn"` (TS 6 has no `baseUrl`) — fix to `@/lib/utils` after each add.
- Laragon's `.test` URL won't work for this project; always use `npm run dev`.
- Firebase MCP has no emulator behind it yet — every write hits **production**. Ask the user first.
- Until the Phase 2 users table, pending users are approved by hand (Firebase console, or MCP with the user's OK).
