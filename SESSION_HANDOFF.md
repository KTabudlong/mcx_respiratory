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
5. **Before coding:** Project rules first (**`.cursor/rules/GENERAL.mdc`** once it exists; created in Phase 0). These override the Laravel-focused global User rules for this repo (no Laravel here).
6. **While coding:** Run **`npm run lint`**, **`npm run format`**, and **`npm run types:check`** after substantive TS/TSX edits (scripts added in Phase 0). Run **`npm run build`** before declaring a deploy-related change done.

---

## Permanent: context & rules

### Project (one minute)

- Announcement board for the **Respiratory Therapy class at Malcolm X College** (City Colleges of Chicago).
- **Frontend only**, hosted free on **GitHub Pages**. Backend = **Firebase Spark (free) plan**: Auth (email/password + email verification) + Firestore.
- **Must stay free:** no Blaze plan, no Cloud Functions, no Firebase Storage. No credit card on the Firebase project.
- **Sign-up restricted** to `@student.ccc.edu` (students) and `@ccc.edu` (instructors), case-insensitive, enforced in UI **and** `firestore.rules`.
- **Roles:** custom roles (admin-defined), a user can hold many. Seed Admin / Moderator / Student. Users store a denormalized `permissions` array so rules can check it.
- **Content:** posts (one author each) + Reddit-style threaded comments. No images in v1 (image links / Cloudinary later). No email blast in v1 (`mailto:` BCC / EmailJS later).
- **Security model:** `firestore.rules` is the backend contract (like Laravel policies + Form Requests). Never rely on UI checks alone.

### Stack (pinned in plan)

- React 19.3, Vite 8.3, **TypeScript 6.0.3** (not 7.x — `typescript-eslint` supports `<6.1`), react-router 8.4 (hash router), firebase 12.19, Tailwind 4.3, shadcn/ui (`new-york`, `neutral`), Vitest 5.0, firebase-tools 15.32.
- Tooling mirrors **`c:\laragon\www\ih_planner`**: same ESLint flat config + Prettier (single quotes, 4 spaces, tailwind plugin), kebab-case filenames, `@/` → `src/`.

### Local environment (Windows, Laragon folder)

- Node 24.19 installed. `winget` available. **Java not installed** — Firebase emulator deferred to Phase 6 (`winget install EclipseAdoptium.Temurin.21.JDK`).
- GitHub CLI (`gh`) not installed.
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

**Last updated:** 2026-10-07

### Last session

**2026-10-07 (session 1) — Planning only (no code)**

- Chose stack: React + TS (Vite) on **GitHub Pages** + **Firebase Spark** (free, no card). Rejected Supabase (user picked Firebase).
- Confirmed free-tier fit: Firestore 50k reads / 20k writes per day; Firebase Storage + Cloud Functions need Blaze → **not used**.
- Decisions: sign-up limited to `student.ccc.edu` + `ccc.edu`; custom roles; members-only reading; light TypeScript; plain `useState` forms; plain-text posts first.
- Reviewed `c:\laragon\www\ih_planner\.cursor` + frontend tooling → plan adopts its ESLint/Prettier/shadcn/folder conventions; Laravel-specific pieces not copied.
- Pinned versions (TS 6.0.3 instead of 7.0 for `typescript-eslint` compatibility).
- Java missing → emulator deferred to Phase 6; use Firebase console **Rules Playground** for manual rule checks until then.
- Plan saved to **`.cursor/plans/mxc_respi_announcements.plan.md`**. Created this handoff, `ROADMAP.md`, `WORK_SESSIONS.md`.
- **Not done yet:** no git repo, no scaffold, no `.cursor/rules` (Phase 0).

### Resume here

1. **User to-dos (before Phase 0):**
   - Create Firebase project on **Spark** (no card) → enable **Email/Password** sign-in → create **Firestore** database.
   - Register a **web app** in that project and keep the config values handy (goes into `.env.local`; agent will provide a template).
   - Create the **GitHub repo** and tell the agent its name (sets Vite `base` / Pages path).
2. **Then Phase 0** (user says "go"): scaffold per plan, copy/adapt `.cursor` rules from `ih_planner`, Firebase init, hello-world deploy via GitHub Actions.

### Caveats

- GitHub Pages has no server rewrites → use a **hash router** (`/#/posts/123`).
- Firebase web config is not secret, but keep it in `.env.local` + GitHub repo variables, not committed.
- Add `<username>.github.io` to Firebase Auth **authorized domains** before testing the deployed site.
