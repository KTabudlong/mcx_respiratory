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
4. **After launch (free add-ons)** — image links / Cloudinary, `mailto:` BCC or EmailJS "email the class", unread badge, categories, due-date posts, PWA.

---

## Short-term checklist

**Planning last reviewed:** 2026-10-07

**Current milestone:** Phase 1 — auth (sign up, log in, verify email, protected routes).

### Phase 0 — Setup (days 1–2) ✅ 2026-10-07

- [x] (User) Firebase project on Spark; Email/Password auth on; Firestore created; web app registered
- [x] (User) GitHub repo created (`KTabudlong/mcx_respiratory`)
- [x] Scaffold Vite 8 + React 19 + TS 6.0 + Tailwind 4 + shadcn/ui + react-router 8 (hash router)
- [x] Copy ESLint/Prettier config from `ih_planner`; npm scripts (`lint`, `format`, `types:check`, `test`)
- [x] `.cursor/rules/GENERAL.mdc` + adapted `imports-and-exports.mdc` / `responsive-design.mdc` + Tailwind skill
- [x] `src/lib/firebase.ts`, `src/lib/config.ts` (allowed domains), `.env.example`, `.env.production`
- [x] GitHub Actions deploy workflow + Vite `base`; hello-world live

### Phase 1 — Auth (days 3–5)

- [ ] Sign up / log in / log out / verify email / password reset
- [ ] School-domain check (`student.ccc.edu`, `ccc.edu`)
- [ ] User profile doc on first login; `AuthProvider` + protected routes

### Phase 2 — Rules + roles foundation (days 6–7)

- [ ] `firestore.rules` (`isMember`, `can()`), deploy with firebase-tools
- [ ] Seed Admin / Moderator / Student; first-admin setup steps
- [ ] Manual checks in Rules Playground

### Phase 3 — Posts (days 8–11)

- [ ] Feed (pinned first, paging 20), create / edit / delete / pin
- [ ] Loading, empty, error states

### Phase 4 — Threaded comments (days 12–15)

- [ ] Comment / reply / edit / soft delete; moderator delete; depth limit; counts

### Phase 5 — Admin (days 16–18)

- [ ] Users list + role assignment; custom role editor; permissions recalculation

### Phase 6 — Polish + launch (days 19–21)

- [ ] Install Java 21 (winget); emulator + automated rules tests
- [ ] Mobile + accessibility pass; invite the class

---

## Blocked / waiting

- Nothing blocking. (Optional user cleanup: delete unused environment variables under GitHub Settings → Environments → `github-pages`.)

---

## Internal changelog

- **2026-10-07** — Project planned; plan, handoff, roadmap, and work log created.
- **2026-10-07** — Phase 0 done: Firebase project set up, app scaffolded, hello-world live on GitHub Pages. Firebase config committed in `.env.production` instead of GitHub variables.
