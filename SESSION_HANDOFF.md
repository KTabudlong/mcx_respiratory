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
- **Roles:** custom roles (admin-defined), a user can hold many. Seed Admin / Moderator / Student. Users store a denormalized `permissions` array so rules can check it.
- **Content:** posts (one author each) + Reddit-style threaded comments. No images in v1 (image links / Cloudinary later). No email blast in v1 (`mailto:` BCC / EmailJS later).
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

**Last updated:** 2026-10-07

### Last session

**2026-10-07 (session 2) — Firebase setup + Phase 0 complete; hello-world live**

- **Firebase** project `mcx-respiratory` on Spark ($0): Email/Password auth on, `ktabudlong.github.io` in authorized domains, public-facing name set, Firestore created in **production mode** (everything locked until Phase 2 rules). Google Analytics got enabled on the project — harmless, not used in the app.
- **GitHub:** a stray `mcxrt.com` custom domain was removed (user doesn't own it; `CNAME` deleted). Pages source = **GitHub Actions**. Default branch switched to **`main`**; work on `dev`, user merges `dev` → `main` to deploy.
- **Phase 0 scaffold** (hand-written, not `npm create vite`): Vite 8.3, React 19.3, TS 6.0.3, Tailwind 4.3, shadcn (`button`, `card`), react-router 8.4 hash router, Vitest 5, ESLint 9 + Prettier copied from `ih_planner`. `src/lib/firebase.ts` (throws a clear error if config is missing), `src/lib/config.ts` (`ALLOWED_EMAIL_DOMAINS` + `isAllowedEmail`, 4 tests), `pages/home.tsx` + `pages/not-found.tsx`. `.cursor/rules/` (GENERAL, imports, responsive) + Tailwind skill.
- **Version decisions:** firebase stays **12.19** (13.0 just released); ESLint stays **9** (react/import plugins don't support 10). `npm audit` flags `@grpc/grpc-js` via Firebase — Node-only, not in the browser bundle; ignore (the "fix" downgrades to firebase 9).
- **Config decision:** GitHub repo/environment variables didn't reach the build (they'd been put under the `github-pages` environment and one was missing). Switched to a committed **`.env.production`** (public identifiers) and removed the `vars.*` lines from the workflow. User should delete the leftover environment variables under Settings → Environments → `github-pages`.
- **Live:** https://ktabudlong.github.io/mcx_respiratory/ shows the hello-world card connected to `mcx-respiratory`. CI runs lint/format/types/tests before building.

### Resume here

1. (User, optional) Delete the 5 unused environment variables under GitHub **Settings → Environments → github-pages** (keep the environment itself).
2. **Phase 1 — Auth:** `AuthProvider` (`src/context/auth-provider.tsx`), sign up / log in / log out / verify email / password reset pages, school-domain check via `isAllowedEmail`, `auth-layout.tsx`, protected routes. Creating the `users/{uid}` profile doc needs Firestore rules — either write a minimal `users` rule early or defer profile creation to Phase 2 (decide at start).
3. Bundle is ~815 kB (Firestore SDK); fine for now — consider route-level code splitting later.

### Caveats

- GitHub Pages has no server rewrites → use a **hash router** (`/#/posts/123`).
- Firebase web config is not secret: committed in `.env.production` for builds; `.env.local` (gitignored) for local dev. No GitHub repository variables needed.
- `ktabudlong.github.io` is already in Firebase Auth **authorized domains**; add any future custom domain there too (and change Vite `base` to `/`).
- `npx shadcn add …` writes `import { cn } from "cn"` (TS 6 has no `baseUrl`) — fix to `@/lib/utils` after each add.
- Laragon's `.test` URL won't work for this project; always use `npm run dev`.
