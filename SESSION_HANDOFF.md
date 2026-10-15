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

**Last updated:** 2026-10-15

### Last session

**2026-10-15 (session 4) — Phases 2b–5b, presidents, votes**

- **Built + rules/indexes deployed; checks green (82 tests). Nothing from this session manually tested yet** — user will walk the ROADMAP checklists next session, then commit/merge when happy.
- **Phases 2b–5:** per-class roles, board + posts, threaded comments, admin dashboards / moderation / user page (details in prior notes; still in `ROADMAP.md`).
- **Phase 5b:** Tiptap rich-text posts (DOMPurify on render), ≤3 photos as Firestore bytes, `students.message` + Email / Text selected (`sms:` batches of 30), `smsOptIn` on join requests + memberships.
- **Edited by:** posts show last editor (`editedBy` / `editedAt`); not set on pin/delete.
- **Class presidents + super admins:** optional President when adding a class; `classRequests/{uid}` (request from pending / board menu → approve/reject); President role = rank 1000 + every permission; Make/Remove super admin on the user page (can't remove yourself). Member create uses `existsAfter` / `getAfter` so class + roles + President can be one batch.
- **Votes:** posts + comments; `…/votes/{uid}` value 1/−1; only the voter can read/change/remove; score via `increment()` in the same batch; feed **New / Top** (pinned first). New posts/comments start at `score: 0`. **Backfill `score: 0` on older posts** still open before Top is complete (optional until inviting the class).
- User merges `dev` → `main` themselves after testing.

### Resume here

1. **User:** run the "(User) Manual test" checklists in `ROADMAP.md` (Phases 2b–5b, edited-by, presidents/super admins, votes). Fix what breaks.
2. **User:** commit on `dev`, then merge `dev` → `main` when happy (Pages still on older `main` until then).
3. Optional: backfill `score: 0` on pre-vote posts so **Top** includes them.
4. **Phase 6** — Java + emulator rules tests, mobile/accessibility pass, invite the class.

### Caveats

- GitHub Pages has no server rewrites → use a **hash router** (`/#/posts/123`).
- Firebase web config is not secret: committed in `.env.production` for builds; `.env.local` (gitignored) for local dev. No GitHub repository variables needed.
- `ktabudlong.github.io` is already in Firebase Auth **authorized domains**; add any future custom domain there too (and change Vite `base` to `/`).
- `npx shadcn add …` writes `import { cn } from "cn"` (TS 6 has no `baseUrl`) — fix to `@/lib/utils` after each add.
- Laragon's `.test` URL won't work for this project; always use `npm run dev`.
- Firebase MCP has no emulator behind it yet — every write hits **production**. Ask the user first.
- **First** super admin is created by hand (`admins/{uid}` `{ createdAt }`); after that, promote/remove from `/admin/users/:userId` (can't remove yourself).
- Invites create the Auth login first, then a Firestore batch; if the batch fails the login exists without a profile (the student can still finish sign-up normally).
- Firebase MCP read-back quirk: `firestore_update_document` / `firestore_get_document` error on fields that are `null` (e.g. `deletedAt`) even when the write succeeded. Pass a `mask` that skips null fields when reading.
