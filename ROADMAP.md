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

**Current milestone:** Phases 2b–5 built (per-class roles, board + posts, threaded comments, admin dashboards / moderation / user page), all rules + indexes deployed; manual testing pending. Next: testing checklist, then Phase 6.

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
- [x] Full `firestore.rules` for users / contacts / classes / roles (`isMember`, `isActive`, `can()`, no privilege escalation), deployed 2026-10-08 (posts/comments rules come with Phases 3–4)
- [x] Seed Admin / Moderator / Student (`roles/admin|moderator|student`); `ktabudlong@student.ccc.edu` made first admin via MCP (steps in handoff § Caveats)
- [x] Lazy-loaded `admin-layout` shell (sidebar, header, "Back to board")
- [x] Classes table (create / edit / archive, member counts)
- [x] Users table: search by first/last name, status filter; add user (second Firebase app instance + set-password email); edit; approve pending; assign classes/roles; deactivate / restore (`users.view` / `users.manage`)
- [x] **Class-anchored model** (2026-10-08): `classes/{classId}/members/{uid}` pivot replaces `users.classIds`; roles per class (on the membership) + app-wide roles on users; posts/comments will nest under `classes/{classId}/posts`. Users form: classes with per-class roles + app-wide roles
- [x] Deploy the class-anchored rules + `members.userId` collection-group index; remove the leftover `classIds` field from the admin's user doc (2026-10-08)
- [x] **Per-class roles designed** (2026-10-08, plan § Data model + § Admin panel): super admin (`admins/{uid}`) → class → class roles (`classes/{c}/roles`, ranked); one role per member; class permissions `admin.access`, `students.view`, `students.manage`, `roles.manage` + content; join requests at sign-up; `users.createdBy`, `members.addedBy`; phone copy on memberships for classmates

### Phase 2b — Per-class roles

- [x] Rules: `isSuperAdmin`, `canIn` via member → class role, rank checks, no escalation, join requests, `createdBy`/`createdInClassId`/`addedBy`, member phone copy; validated
- [x] Deploy rules + collection-group indexes (`members.userId`, `joinRequests.userId`), 2026-10-15
- [x] Data: create `admins/{uid}` for the user; delete global `roles` + interim fields (`users.roleIds`/`permissions`), 2026-10-15
- [x] Types + permissions constants (`students.*`, `admin.access`), rank / grant helpers + tests
- [x] Sign-up profile step: pick a class → join request; `/pending` request/cancel; profile save syncs phone to memberships
- [x] Admin shell: class switcher (classes with `admin.access`), super admin sections
- [x] Class pages: Students (roster with phones, join requests, invite, change role, remove), Roles (rank, color, permission checkboxes)
- [x] Super admin pages: Classes (create with the default Student role), Users (deactivate/restore, invited by)
- [ ] (User) Manual test: create class, add President + Treasurer roles, invite a President, sign up a test student who picks the class, approve as President, give Treasurer `admin.access` + `students.view` without `students.manage`

### Phase 3 — Posts (days 11–14)

- [x] Reddit-style `board-layout` (top bar, class switcher, user menu, right sidebar with class info + pinned links)
- [x] Feed (pinned first, "load more" by 20, title search), post page, create / edit / soft delete / pin
- [x] Loading, empty, error states; archived classes are read-only
- [x] Posts rules + feed index (`deletedAt`, `pinned` desc, `createdAt` desc)
- [x] Deploy posts rules + index, 2026-10-15
- [ ] (User) Manual test: post as a student, edit/delete own post, pin and delete someone else's as a moderator role, archived class is read-only

### Phase 4 — Threaded comments (days 15–18)

- [x] Comment / reply / edit / soft delete; moderator delete (`comments.delete_any`); collapse threads; "[deleted]" placeholders keep replies in place
- [x] Depth limit 5 levels, enforced in the rules via `ancestorIds` (materialized path)
- [x] Counts: feed cards use Firestore `count()`; the post page counts the live thread
- [x] Comments rules + index (`deletedAt`, `createdAt`), validated
- [x] Deploy comments rules + index, 2026-10-15
- [ ] (User) Manual test: comment, reply 5 levels deep, edit, delete a comment that has replies, delete someone else's as a moderator role

### Phase 5 — Rest of the CRM admin panel (days 19–22)

- [x] Dashboard stat cards (`count()`): super admin overview at `/admin`, class overview at `/admin/classes/:classId`; breadcrumbs in the admin header
- [x] Students roster: row selection + "Email selected" (mailto BCC, copy-addresses fallback). Full data-table upgrade (sort, column visibility) skipped — class-size tables don't need it
- [x] Super admin user page `/admin/users/:userId` (profile, contact, classes + roles, join requests, post/comment totals, recent posts); names in the users table link to it
- [x] Moderation page `/admin/classes/:classId/moderation` (`posts.delete_any` or `comments.delete_any`): all / live / deleted posts, delete + restore, expand a post for its comments (delete + restore)
- [x] Rules + indexes for the user page: super admin collection-group reads of `posts` / `comments`; `posts` (`userId`, `createdAt` desc) group index; `posts.userId` / `comments.userId` group overrides; validated
- [x] Deploy the user-page rules + indexes, 2026-10-15
- [ ] (User) Manual test: dashboards, breadcrumbs, email selected, user page, moderation delete/restore as a moderator role

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
- **2026-10-08** — Phase 1 done and tested. Phase 2 built: full rules deployed, roles seeded, first admin set, lazy-loaded admin panel with classes + users tables. Student role can create posts. Admins land on `/admin` after login; "Open board" opens `/` in a new tab (URLs stay hash-based).
- **2026-10-08** — Class is the anchor: membership pivot (`classes/{classId}/members/{uid}`), roles per class plus app-wide roles, posts/comments nested under classes.
- **2026-10-08** — Designed (not built): super admin → class → ranked class roles; class officers get their own admin panel; join requests at sign-up; `createdBy`/`addedBy` audit fields; classmates see phones. Roles editor moves from Phase 5 into Phase 2b.
