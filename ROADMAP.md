# Roadmap (internal)

**Planning and engineering checklist** for this repo. Full implementation detail lives in **`.cursor/plans/mxc_respi_announcements.plan.md`**.

**Session handoff** (`SESSION_HANDOFF.md`) = agent rules + last-session continuity—not duplicate checklists here.

---

## Maintaining this document

- **After each planning session:** set **Planning last reviewed** to today, add/remove/reorder `- [ ]` items, tick finished work.
- **Long-term roadmap:** touch only when priorities change. Keep it short and outcome-shaped.
- **Current milestone:** one line under **§ Short-term checklist**; change it when the focus moves.
- **Blocked / waiting:** dependencies outside the agent's control. Remove rows once unblocked.

---

## Long-term roadmap

1. **Usable class board** — members-only posts + threaded comments, school-email sign-up, live on GitHub Pages.
2. **Roles & moderation** — custom roles, admin role assignment, moderator tools, enforced by `firestore.rules`.
3. **Stay free** — Firebase Spark + GitHub Pages only; no paid services.
4. **After launch (free add-ons)** — upvotes, image links / Cloudinary, `mailto:` BCC or EmailJS "email the class", Remind/GroupMe link for SMS, unread badge, categories, due-date posts, PWA.

---

## Short-term checklist

**Planning last reviewed:** 2026-10-08

**Current milestone:** Phase 1 — auth (sign up, log in, verify email, pending profile, protected routes).

### Planning — data model + UI ✅ 2026-10-08

- [x] Normalized data model mapped to Firestore (plan § Data model)
- [x] Two-UI design: Reddit-style board + CRM-style admin panel, one SPA (plan § Two interfaces)
- [x] `react-standards.mdc` rule (SOLID in React terms, SPA navigation)
- [x] Firebase MCP configured (`.cursor/mcp.json`, auth + firestore only)
- [x] (User) Enable Firebase MCP in Cursor Settings → MCP; sign in on first use

### Phase 0 — Setup (days 1–2) ✅ 2026-10-07

- [x] (User) Firebase project on Spark; Email/Password auth on; Firestore created; web app registered
- [x] (User) GitHub repo created (`KTabudlong/mcx_respiratory`)
- [x] Scaffold Vite 8 + React 19 + TS 6.0 + Tailwind 4 + shadcn/ui + react-router 8 (hash router)
- [x] Copy ESLint/Prettier config from `ih_planner`; npm scripts (`lint`, `format`, `types:check`, `test`)
- [x] `.cursor/rules/GENERAL.mdc` + adapted `imports-and-exports.mdc` / `responsive-design.mdc` + Tailwind skill
- [x] `src/lib/firebase.ts`, `src/lib/config.ts` (allowed domains), `.env.example`, `.env.production`
- [x] GitHub Actions deploy workflow + Vite `base`; hello-world live

### Phase 1 — Auth (days 3–5)

- [x] (User) Firebase sign-in for deploying rules (Firebase MCP, `laotabudlong@gmail.com`)
- [x] `firebase.json` + minimal `firestore.rules` (own pending `users` + `userContacts` doc only), deployed 2026-10-08
- [x] `AuthProvider`, `auth-layout`, log in / log out / forgot password
- [x] Stepper sign-up: account (school-domain check) → verify email → profile (first/last name, optional contact + SMS opt-in) → done; step derived from account state
- [x] `/pending` screen + protected routes (`RequireAuth`, `GuestOnly`)
- [x] (User) Manual test with a real `@student.ccc.edu` address: verification email arrives, profile saves, `/pending` shows (2026-10-08, `ktabudlong@student.ccc.edu`)

### Phase 2 — Rules, roles + users admin (days 6–10)

- [x] Data model decided (2026-10-08): classes, roles, users (`classIds`/`roleIds` arrays), `userContacts`, posts (embedded links), threaded comments; soft deletes + timestamps — see plan § Data model
- [ ] Full `firestore.rules` (`isMember`, `isActive`, `can()`, class-scoped reads, no privilege escalation), deployed
- [ ] Seed Admin / Moderator / Student; first-admin setup steps
- [ ] Lazy-loaded `admin-layout` shell (sidebar, breadcrumbs)
- [ ] Classes table (create / edit / archive)
- [ ] Users table: search by first/last name; add user (second Firebase app instance + set-password email); edit; approve pending; assign classes/roles; soft delete / restore (`users.view` / `users.manage`)
- [ ] Manual checks in Rules Playground

### Phase 3 — Posts (days 11–14)

- [ ] Reddit-style `board-layout` (top bar, class switcher, right sidebar)
- [ ] Feed (pinned first, paging 20), create / edit / delete / pin
- [ ] Loading, empty, error states

### Phase 4 — Threaded comments (days 15–18)

- [ ] Comment / reply / edit / soft delete; moderator delete; depth limit; counts

### Phase 5 — Rest of the CRM admin panel (days 19–22)

- [ ] Dashboard stat cards
- [ ] Data table upgrade: filters, sort, column visibility, row selection, bulk actions (incl. "email selected")
- [ ] User detail tabs (profile, contact, classes/roles, activity); class detail with members
- [ ] Roles table + permission editor + permissions recalculation
- [ ] Posts / comments moderation tables (incl. restore)

### Phase 6 — Polish + launch (days 23–25)

- [ ] Install Java 21 (winget); emulator + automated rules tests
- [ ] Mobile + accessibility pass; invite the class

---

## Blocked / waiting

- Nothing blocking. (Optional user cleanup: delete unused environment variables under GitHub Settings → Environments → `github-pages`.)

---

## Internal changelog

- **2026-10-07** — Project planned; plan, handoff, roadmap, and work log created.
- **2026-10-07** — Phase 0 done: Firebase project set up, app scaffolded, hello-world live on GitHub Pages. Firebase config committed in `.env.production` instead of GitHub variables.
- **2026-10-08** — Planning milestone: data model (multi-class, pending users, roles master table, private contacts, embedded links, soft deletes), Reddit board + CRM admin design, React standards rule, Firebase MCP. Upvotes moved to after launch. Stepper sign-up; admin-created accounts (second app instance + set-password email); `users.view`/`users.manage`; users table moved to Phase 2 (launch ~4–5 weeks).
