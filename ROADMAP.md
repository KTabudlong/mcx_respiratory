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

**Planning last reviewed:** 2026-10-21

**Current milestone:** Manual testing on the **test project** (sections 0–7 of the 2026-10-21 run pass; 8–9 tested with feedback, now fixed; 10–11 left). 2026-10-21 changes need re-checking, and their rules go to production with the `dev` → `main` merge. Then Phase 6.

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
- [ ] (User) Manual test (run `npm run dev`; use incognito / a second browser profile for other accounts; needs extra real `@student.ccc.edu` / `@ccc.edu` addresses). Test setup 2026-10-19: classA (testA = President), classB (empty), testB with no class:
  - [x] Super admin: create a test class → it starts with only a Student role
  - [ ] Roles page: add President (high rank; `admin.access`, `students.view`, `students.manage`) and Treasurer (lower rank; `admin.access`, `students.view` only). **2026-10-19: President was created at rank 1 (same as Student), so testA couldn't invite / change roles — raise President's rank (e.g. 1000) first**
  - [x] President sees the class admin pages (2026-10-19, testA)
  - [ ] Students page: invite a second address as President → set password from the email → log in
  - [ ] Sign up a third address and pick the class → `/pending` shows the request; cancel and re-request work
  - [ ] As President: approve the request → person appears in the roster with their phone (if given)
  - [ ] As President: roles at or above President aren't offered when changing someone's role
  - [ ] As Treasurer: roster visible, but no invite / approve / change role / remove
  - [ ] Remove a member → they lose access to the class; their account stays

### Phase 3 — Posts (days 11–14)

- [x] Reddit-style `board-layout` (top bar, class switcher, user menu, right sidebar with class info + pinned links)
- [x] Feed (pinned first, "load more" by 20, title search), post page, create / edit / soft delete / pin
- [x] Loading, empty, error states; archived classes are read-only
- [x] Posts rules + feed index (`deletedAt`, `pinned` desc, `createdAt` desc)
- [x] Deploy posts rules + index, 2026-10-15
- [ ] (User) Manual test:
  - [ ] As a student: create a post with body + 2 links (a link without `https://` gets it added)
  - [ ] Edit own post; delete own post → gone from the feed
  - [ ] With a role that has `posts.pin` + `posts.delete_any`: pin someone else's post (moves to top), delete it
  - [ ] Feed search filters by title; "Load more" appears past 20 posts
  - [ ] Archive the class (super admin) → board is read-only (no new posts / edits)

### Phase 4 — Threaded comments (days 15–18)

- [x] Comment / reply / edit / soft delete; moderator delete (`comments.delete_any`); collapse threads; "[deleted]" placeholders keep replies in place
- [x] Depth limit 5 levels, enforced in the rules via `ancestorIds` (materialized path)
- [x] Counts: feed cards use Firestore `count()`; the post page counts the live thread
- [x] Comments rules + index (`deletedAt`, `createdAt`), validated
- [x] Deploy comments rules + index, 2026-10-15
- [ ] (User) Manual test:
  - [ ] Comment on a post; reply until replies stop being offered (5 levels)
  - [ ] Edit a comment; collapse / expand a thread
  - [ ] Delete a comment that has replies → shows "[deleted]", replies stay in place
  - [ ] With a `comments.delete_any` role: delete someone else's comment
  - [ ] Comment count on the feed card matches

### Phase 5 — Rest of the CRM admin panel (days 19–22)

- [x] Dashboard stat cards (`count()`): super admin overview at `/admin`, class overview at `/admin/classes/:classId`; breadcrumbs in the admin header
- [x] Students roster: row selection + "Email selected" (mailto BCC, copy-addresses fallback). Full data-table upgrade (sort, column visibility) skipped — class-size tables don't need it
- [x] Super admin user page `/admin/users/:userId` (profile, contact, classes + roles, join requests, post/comment totals, recent posts); names in the users table link to it
- [x] Moderation page `/admin/classes/:classId/moderation` (`posts.delete_any` or `comments.delete_any`): all / live / deleted posts, delete + restore, expand a post for its comments (delete + restore)
- [x] Rules + indexes for the user page: super admin collection-group reads of `posts` / `comments`; `posts` (`userId`, `createdAt` desc) group index; `posts.userId` / `comments.userId` group overrides; validated
- [x] Deploy the user-page rules + indexes, 2026-10-15
- [ ] (User) Manual test:
  - [ ] `/admin` and class overview numbers match reality; cards link to the right pages
  - [ ] Breadcrumbs correct (phone width shows only the current page); header "Open board" opens the class board
  - [ ] Moderation: All / Live / Deleted filter + title search; delete + restore a post (board updates); expand a post, delete + restore a comment
  - [ ] Role with only `comments.delete_any`: Moderation shows live posts only, no post delete / restore
  - [ ] Students: select a few → "Email (BCC)", "Copy addresses", "Clear"; header checkbox selects everyone matching the search
  - [ ] User page (from All users): profile, phone, classes + roles, recent posts ("Deleted" badge on deleted ones)
  - [ ] Non-super admin: `/admin/users/...` and All classes show no access

### Decided 2026-10-15 (afternoon)

- [x] Posts show who last edited them ("edited by Name · time"): `editedBy` / `editedAt`, set only on content edits (not pins / deletes); rules require `editedBy` = the editor; validated
- [x] Deploy the edited-by rules, 2026-10-15
- [x] Pinning stays a role permission (`posts.pin`) — already built
- [x] New classes keep only the **Student** role by default
- [x] **Votes** (built; rules validated) — posts and comments; up / down; tap again to remove, tap the other to switch; only the voter can change or remove their vote (no one else, super admins included); anonymous (each person can read only their own vote); authors may vote on their own posts; score (up − down) shown; feed gets **New / Top** sort (pinned stay first). Data: `…/votes/{uid}` with `userId`, `classId`, `value` 1 or −1 (no doc = no vote); `score` on the post / comment changes in the same batch via `increment()`, and the rules check it moves by exactly the voter's change. "My votes" is one collection-group query per class. New posts / comments start at `score: 0`.
- [x] Deploy the votes rules + 2 indexes (Top feed; votes by userId + classId), 2026-10-15
- [ ] Backfill `score: 0` on posts created before votes (they're missing from **Top** until then; New is unaffected; missing comment scores just show 0). Only test data so far, so this can wait until right before inviting the class
- [ ] (User) Manual test — votes:
    - [ ] Upvote a post on the feed → arrow fills, score +1; tap again → removed, score back
    - [ ] Upvote then tap downvote → switches, score −2 from the upvoted state
    - [ ] Same on the post page and on comments (including replies)
    - [ ] Vote on your own post works
    - [ ] Second account votes too → score reflects both; neither account sees who voted
    - [ ] Archived class → score shows, no vote buttons
    - [ ] Feed **Top** → pinned first, then highest score, then newest; **New** → pinned, then newest
- [x] **Class presidents + super admins** (built; rules deployed 2026-10-15) — (A) super admin creates a class and picks its President from existing users; (C) any signed-in user can request a new class (name, years, note), the super admin approves or rejects; approving creates the class with Student + President roles (President = top rank, every permission) and makes the requester President. Plus "Make super admin" / "Remove super admin" on the user page (can't remove yourself). Rules: member create now uses `existsAfter` / `getAfter` for the class and role (one batch creates class + roles + President); new `classRequests/{uid}`; promoting requires an active account.
- [x] Deploy the class presidents / super admin rules, 2026-10-15
- [ ] (User) Manual test — class presidents + super admins:
    - [ ] Admin › Classes › Add class with no President → only a Student role, no members
    - [ ] Add class with a President → Student + President roles; that person is a member with the President role (phone / SMS consent copied from their profile)
    - [ ] As the President: all class admin pages work; can create roles below President and promote students, but can't edit the President role
    - [ ] Pending account: "Request a new class" → form → shows "Waiting for the admin"; Cancel request removes it
    - [ ] Board user menu › Request a new class → same dialog (shows your open request if you sent one)
    - [ ] Super admin Overview shows the "class requests waiting" banner; Classes page lists the request with the note
    - [ ] Approve → class created, requester becomes President, pending page moves them to the board by itself; request disappears
    - [ ] Reject → request disappears; requester can send a new one
    - [ ] User page › Make super admin → badge appears, they get the admin panel; Remove super admin → gone; the button doesn't show on your own page or on deactivated accounts
- [ ] (User) Manual test: edit someone's post with `posts.edit_any` → "edited by" shows your name; pin / delete don't change it

### Decided + built 2026-10-19 (during manual testing)

- [x] Students page: changing a role from the dropdown asks for confirmation first (Cancel keeps the old role)
- [x] Roles page: info tooltip on the Rank column ("higher rank = higher in the hierarchy")
- [x] **Invites for existing accounts:** "Invite student" creates a new account if the email is unused; otherwise writes `classes/{c}/invites/{email}` and the person accepts / declines from the board or `/pending` (their own phone + SMS consent copy over). "Invited" card on Students with Cancel. Officers still can't browse users
- [x] **Notifications:** `users/{uid}/notifications`, written in the same batch as add / approve / invite new account / role change / remove / President of a new class; rules check each matches the change. Bell + unread count on the board; unread on `/pending` with Dismiss
- [x] **Email consent:** "Email me when my classes change" checkbox (`userContacts.emailOptIn`, student-only, optional in rules); shown on the super admin user page. Nothing sends email yet
- [x] **`/profile` page** (board account menu + `/pending`): name, phone, SMS + email consent; keeps original consent timestamps
- [x] Deploy rules + `invites.email` collection-group index, 2026-10-19
- [ ] (User) Manual test — 2026-10-19 additions:
    - [ ] Change a role from the Students dropdown → confirm dialog; Cancel keeps the old role
    - [ ] Roles page: hover the Rank info icon → tooltip
    - [ ] As President (rank raised): invite an existing account's email → "Invite sent", listed under Invited; Cancel invite removes it
    - [ ] That account logs in → "You're invited to join … as …" on the board or `/pending`; Accept → on the roster with their phone; Decline → invite gone
    - [ ] Invite a brand-new email → account created in the class as before; on first login their bell shows "added you to …"
    - [ ] Approve a join request / change a role / remove → the student's bell shows it (removed → `/pending` shows it with Dismiss); closing the bell clears the count
    - [ ] Add a class with a President (or approve a class request) → the President gets "added you to … as President"
    - [ ] Profile: change phone + SMS + email consent → saved; roster phone updates; super admin user page shows "Email updates: Opted in"
- [ ] Super admin edit of a user's name + phone with a change log (who, when, field, old → new); SMS / email consent stays student-only (agreed 2026-10-19, not built)
- [ ] Decide email delivery for class-change notifications (EmailJS free tier vs officer's own mail app); only email people with `emailOptIn`

### Decided + built 2026-10-21 (test project + testing feedback)

- [x] Second Firebase project `mcx-respiratory-test` for local dev (`.env.local`, `.firebaserc` alias `test`), Auth emails via Mailtrap SMTP; rules + indexes deployed; super admin `superadmin@student.ccc.edu` created by hand
- [x] "TEST · project" badge when not on the live project (`LIVE_PROJECT_ID` in `src/lib/config.ts`)
- [x] Sign-up: picking a class is optional; `/pending` says "Join a class" until a request is sent
- [x] Admin sidebar open/collapsed saved in `localStorage`
- [x] Success toasts (sonner) for every confirm dialog (now required `successMessage`) and the other actions (invites, approve/reject, accept/decline, requests, profile, posts, pins, moderation restore); errors stay inline
- [x] Admin header: notifications bell + the board's account menu (shared `UserMenu`: Profile, Board / Admin panel, Request a new class, Log out)
- [x] Log out always lands on a clean `/login` (next account goes to its own home, not the last page)
- [x] Feed search matches the post text too (still loaded posts only)
- [x] Post edit history: `editCount` + `edits/{n}` (who, when, what changed), enforced by rules; dialog from "edited by …"
- [x] Deleted comments always show "[deleted]" (text moved to `archive/body`, author + moderators only; restore brings it back); moderation shows archived text
- [x] Comment sort: Sort by Score / Date + ascending / descending (default score, highest first), every reply level
- [x] Deploy 2026-10-21 rules to the **test** project
- [ ] **Deploy 2026-10-21 rules to production together with the `dev` → `main` merge** (see Blocked / waiting)
- [ ] (User) Re-check 2026-10-21 changes: sign up with no class; sidebar stays collapsed after reload; toasts on invite / decline / approve etc.; admin account menu + log out → login as another user lands on their home; search finds words in post text; edit a post twice → history dialog lists both with what changed; delete a comment with no replies → "[deleted]" stays, moderator restores it; comment Sort by Score / Date + direction
- [ ] (User) Finish the 2026-10-21 test run: section 10 (admin panel: overview, moderation, email / text) and 11 (archive)
- [ ] Open question: "Comments (5)" while 4 visible on one post — not reproduced; re-check after tombstones

### Phase 6 — Polish + launch (days 23–25)

- [ ] Install Java 21 (winget); emulator + automated rules tests
- [ ] Mobile + accessibility pass; invite the class

### Phase 5b — Rich text, photos, texting (built 2026-10-15 on `dev`)

User decisions: gallery (not inline) photos, max 3 per post; quotes + divider, no tables; text batches of 30; messaging is a role permission.

- [x] Rich-text posts (Tiptap free core): bold, italic, heading, subheading, lists, quote, divider, link, undo/redo; saved as HTML (`format: 'html'`), sanitized with DOMPurify on every render; old plain-text posts still render and convert when edited; editor is its own lazy chunk; body limit 20,000 (HTML); comments stay plain text
- [x] Photo gallery: up to 3 per post, shrunk in the browser (≤1600 px, WebP/JPEG, ≤450 KB) and stored as Firestore bytes in `posts/{p}/images/{id}`; feed shows a photo count only; tap a photo for full size
- [x] New class permission `students.message` ("Email and text selected students") gates roster selection, Email (BCC) and Text
- [x] "Text selected": `sms:` group text from the admin's phone, opted-in members with a phone only, batches of 30, optional message, "Copy numbers" / "Copy message" for computers; `smsOptIn` copied onto join requests + memberships
- [x] Rules: post `format` / `imageIds` (≤3), images subcollection, `smsOptIn` copies; validated
- [x] Deploy rules, 2026-10-15
- [ ] (User) Manual test:
  - [ ] Roles page: give a role "Email and text selected students"; without it, the roster has no checkboxes
  - [ ] New post with heading, bold, list, quote, divider and a link; the post page shows the formatting; the feed card shows a plain-text preview
  - [ ] Edit an older plain-text post: text carries over, saves as rich text
  - [ ] Add 3 photos (a phone photo too); the 4th is refused; the post page gallery opens full size; edit to remove one / add one
  - [ ] Delete a post with photos as a moderator → photos hidden; restore → back
  - [ ] Profile save with SMS opt-in → membership gets the opt-in; Text dialog lists only opted-in members with phones, skipped names shown
  - [ ] Android phone: "Open in Messages" opens a group text with the numbers and message; on PC: "Copy numbers" into Google Messages for web / Phone Link

---

## Blocked / waiting

- Nothing blocking. Unused GitHub environment variables cleaned up (user, 2026-10-15).
- Merge `dev` → `main` waits until the user finishes the Phase 2b–5b / presidents / votes / 2026-10-19 manual tests. Production rules are already ahead of `main` (additive / optional fields, so the older live site still works).
- **2026-10-21 rules (post edit history `editCount` + `edits/{n}`, comment tombstones + `archive/body`) are deployed to the TEST project only.** They break post editing / comment deleting on the older live site, so deploy them to production (`--project default`) **together with** the `dev` → `main` merge.

---

## Internal changelog

- **2026-10-07** — Project planned; plan, handoff, roadmap, and work log created.
- **2026-10-07** — Phase 0 done: Firebase project set up, app scaffolded, hello-world live on GitHub Pages. Firebase config committed in `.env.production` instead of GitHub variables.
- **2026-10-08** — Planning milestone: data model (multi-class, pending users, roles master table, private contacts, embedded links, soft deletes), Reddit board + CRM admin design, React standards rule, Firebase MCP. Upvotes moved to after launch. Stepper sign-up; admin-created accounts (second app instance + set-password email); `users.view`/`users.manage`; users table moved to Phase 2 (launch ~4–5 weeks).
- **2026-10-08** — Phase 1 done and tested. Phase 2 built: full rules deployed, roles seeded, first admin set, lazy-loaded admin panel with classes + users tables. Student role can create posts. Admins land on `/admin` after login; "Open board" opens `/` in a new tab (URLs stay hash-based).
- **2026-10-08** — Class is the anchor: membership pivot (`classes/{classId}/members/{uid}`), roles per class plus app-wide roles, posts/comments nested under classes.
- **2026-10-08** — Designed (not built): super admin → class → ranked class roles; class officers get their own admin panel; join requests at sign-up; `createdBy`/`addedBy` audit fields; classmates see phones. Roles editor moves from Phase 5 into Phase 2b.
- **2026-10-19** — Manual testing started. Built + deployed: role-change confirm, rank tooltip, invites for existing accounts (accept / decline), in-app notifications for class changes, email-update consent, `/profile` page. Agreed: super admin can edit name + phone with a change log (not built); consent stays student-only.
- **2026-10-21** — Test Firebase project + Mailtrap for fake accounts; TEST badge. Testing feedback built: optional class at sign-up, saved sidebar state, toasts everywhere, admin account menu, clean logout redirect, text search, post edit history (rules-enforced), Reddit-style "[deleted]" comments, comment sort by score / date + direction. New rules on the test project only until the merge.
