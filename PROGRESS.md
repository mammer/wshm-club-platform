# PROGRESS.md — W.S.H.M Website

Read this at the start of every new conversation to understand the full project state without reading source code.

**Last updated:** 2026-05-26

---

## PROJECT OVERVIEW

- **Club:** W.S.H.M — Wefak Sportif Hassanyat Madagh, founded 1956, Madagh (Province Berkane), Morocco
- **Stack:** Next.js 16.2.6 (App Router), React 19, Prisma 5 (SQLite dev / MySQL prod), NextAuth.js v5 (beta.31), Tailwind CSS v4, next-intl v4, Tiptap v3
- **Hosting target:** PlanetHoster World shared hosting (Node.js + MySQL)
- **Languages:** French (default, `fr`) + Arabic (RTL, `ar`)
- **Admin panel:** French only (by design)
- **Brand colors:** `#CC0000` red · `#1a1a1a` black · `#C8A84B` gold
- **Fonts:** Inter (Latin) + Cairo (Arabic) — self-hosted via `next/font`, no external CDN

---

## REPO STRUCTURE

```
app/
  layout.tsx                   — root layout (minimal, no locale)
  [locale]/                    — public site (fr | ar)
    layout.tsx                 — locale layout: Navbar + Footer + CookieBanner + skip-to-content
    page.tsx                   — homepage
    about/                     — club history, board members
    blog/                      — news listing + [slug] detail
    gallery/                   — photo gallery
    players/                   — public player profiles
    scores/                    — match results
    tournament/                — tournament info + registration form
    privacy/                   — privacy policy
  admin/
    layout.tsx                 — AdminShell (SPA nav, sidebar, session check)
    login/                     — credential login page
    dashboard/                 — role-aware stats dashboard
    players/                   — player CRUD
    coaches/                   — coach CRUD
    scores/                    — match/score CRUD
    attendance/                — attendance sessions CRUD
    blog/                      — blog post CRUD (Tiptap editor)
    gallery/                   — photo upload/manage
    payments/                  — player payment CRUD
    expenses/                  — club expense CRUD
    members/                   — board member CRUD
    meetings/                  — meeting notes CRUD
    tournaments/               — tournament + registrations management
    sponsors/                  — sponsor CRUD
    archive/                   — document archive CRUD
    calendar/                  — unified event calendar
    users/                     — admin user management (ADMIN only)
    audit/                     — audit log viewer (ADMIN only)
    settings/                  — club settings (ADMIN only)
    profile/                   — own profile edit (all roles)
  api/
    auth/                      — NextAuth handlers
    players/ coaches/ scores/ matches/ meetings/ payments/ blog/ gallery/
    tournaments/ expenses/ members/ archive/ attendance/ stats/ upload/
    sponsors/ users/ settings/ calendar/ profile/ audit/

src/
  components/
    admin/                     — admin UI components (forms, tables, AdminShell)
    layout/                    — Navbar, Footer
    public/                    — public-facing components (CookieBanner, etc.)
    ui/                        — shared primitives
  lib/
    auth.ts                    — NextAuth config (credentials provider, JWT)
    prisma.ts                  — Prisma client singleton
    apiAuth.ts                 — requireRoles(), CSRF origin check helper
    roles.ts                   — ROUTE_PERMISSIONS, canAccess(), ROLE_HOME, ALLOWED_NAV
    rateLimit.ts               — in-memory rate limiter (used for tournament registration)
    swal.ts                    — SweetAlert2 wrappers
    adminT.ts                  — admin translation helper (French-only)
    audit.ts                   — audit log writer
    print.ts                   — print utilities
    types.ts                   — shared TypeScript types
    usePagination.ts           — pagination hook
  i18n/
    routing.ts                 — next-intl routing config (locales: fr, ar; default: fr)
    request.ts                 — next-intl server request config
    messages/
      fr.json                  — French translations
      ar.json                  — Arabic translations
  middleware.ts                — auth guard (admin) + i18n routing (public)
  generated/prisma/            — Prisma client output (gitignored)

prisma/
  schema.prisma                — DB schema (provider: sqlite dev, mysql prod)
  dev.db                       — local SQLite DB (gitignored)

scripts/
  seed-admin.ts                — seeds first AdminUser
  seed-archive.ts              — seeds sample archive documents
  seed-league.ts               — seeds sample league matches

public/
  uploads/                     — local file uploads (must exist on server, chmod 755)
  logo.png                     — club logo
```

---

## DATABASE MODELS

| Model | Key fields |
|---|---|
| `Player` | fullName, category (MINIMES/CADETS/JUNIORS/SENIORS), position, licenseNumber, birthDate, phone, jerseyNumber, isActive, cin, nationality, address, parentName/Phone/Cin (minors), medicalDate |
| `Coach` | fullName, role, category, license, phone, cin, birthDate, nationality, experience, medicalDate |
| `Match` | category, homeTeam, awayTeam, homeScore, awayScore, matchDate, location, matchday, competition (default: CHAMPIONNAT) |
| `Meeting` | title, meetingDate, location, agenda, notes, decisions, attendeeCount, documentUrl |
| `Payment` | playerId, amount, paymentDate, paymentType (COTISATION/LICENCE/EQUIPEMENT/AUTRE), season, recordedBy |
| `BlogPost` | slug, titleFr, titleAr, contentFr, contentAr, coverImageUrl, author, published, publishedAt |
| `Tournament` | nameFr/Ar, tournamentDate, registrationDeadline, categories, descriptionFr/Ar, isOpen |
| `TournamentRegistration` | tournamentId, clubName, contactName/Phone/Email, coachName/License, category, playerCount, ageGroupMin/Max, hasMedicalCerts, paymentMethod, status (PENDING/CONFIRMED/REJECTED) |
| `GalleryPhoto` | titleFr/Ar, imageUrl, category (string grouping), eventDate |
| `AdminUser` | email, password (bcrypt), name, role (ADMIN/SECRETARY/AUTHOR/COACH), photoUrl |
| `Expense` | category (TRANSPORT/ALIMENTATION/DEPLACEMENT/SALAIRES/EQUIPEMENT/ARBITRAGE/ADMINISTRATION/AUTRE), amount, expenseDate, description, vendor, paidBy, receiptUrl, season |
| `ClubSettings` | key (unique), value — key/value store for club-wide settings |
| `Sponsor` | name, logoUrl, amount, startDate, endDate, tier (OR/ARGENT/BRONZE), isActive |
| `Attendance` | sessionDate, sessionType (ENTRAINEMENT/MATCH), category → has many `AttendanceRecord` |
| `AttendanceRecord` | sessionId, playerId, present, justification |
| `PlayerStat` | playerId, matchId, season, goals, assists, yellowCards, redCards, minutesPlayed |
| `AuditLog` | action (CREATE/UPDATE/DELETE), entity, entityId, details, userName |
| `Archive` | title, category (REUNION/JURIDIQUE/STATUTS/CONTRAT/CORRESPONDANCE/FINANCIER/AUTRE), fileUrl, fileType, fileSize, year, uploadedBy |
| `Member` | fullName, role (PRESIDENT/VICE_PRESIDENT/SECRETARY/TREASURER/MEMBER/HONORARY), phone, email, birthDate, joinDate, cin, isActive |

---

## ROLES & PERMISSIONS

| Role | Access |
|---|---|
| `ADMIN` | Everything |
| `SECRETARY` | All except `/admin/users`, `/admin/audit`, `/admin/settings` |
| `COACH` | `/admin/players`, `/admin/coaches`, `/admin/attendance`, `/admin/scores`, `/admin/dashboard`, `/admin/calendar`, `/admin/profile` |
| `AUTHOR` | `/admin/blog`, `/admin/gallery`, `/admin/dashboard`, `/admin/profile` |

Enforced in three places:
1. `src/middleware.ts` — route-level redirect using `canAccess()` from `roles.ts`
2. `AdminShell` — sidebar filtered by `ALLOWED_NAV[role]`
3. API routes — `requireRoles()` from `apiAuth.ts` + CSRF origin check

---

## PUBLIC PAGES (`/[locale]/`)

| Route | Description |
|---|---|
| `/` | Homepage — hero, latest news, sponsors |
| `/about` | Club history, board members |
| `/blog` | News article listing |
| `/blog/[slug]` | Article detail with FR/AR content |
| `/gallery` | Photo gallery (grouped by category) |
| `/players` | Public player profiles listing |
| `/scores` | Match results by category |
| `/tournament` | Active tournament info + external registration form |
| `/privacy` | Privacy policy |

---

## ADMIN PAGES (`/admin/`)

| Route | Roles | Description |
|---|---|---|
| `/admin/login` | — | Credential login |
| `/admin/dashboard` | All | Role-aware stats overview |
| `/admin/players` | ADMIN/SECRETARY/COACH | Player CRUD + profile details |
| `/admin/coaches` | ADMIN/SECRETARY/COACH | Coach CRUD |
| `/admin/scores` | ADMIN/SECRETARY/COACH | Match/score entry |
| `/admin/attendance` | ADMIN/SECRETARY/COACH | Training + match attendance |
| `/admin/payments` | ADMIN/SECRETARY | Player payment records |
| `/admin/expenses` | ADMIN/SECRETARY | Club expenses |
| `/admin/members` | ADMIN/SECRETARY | Board members |
| `/admin/meetings` | ADMIN/SECRETARY | Meeting notes |
| `/admin/tournaments` | ADMIN/SECRETARY | Tournament management + registrations |
| `/admin/sponsors` | ADMIN/SECRETARY | Sponsor management |
| `/admin/archive` | ADMIN/SECRETARY | Document archive |
| `/admin/blog` | ADMIN/SECRETARY/AUTHOR | Blog post editor (Tiptap) |
| `/admin/gallery` | ADMIN/SECRETARY/AUTHOR | Photo upload/manage |
| `/admin/calendar` | All | Unified calendar view |
| `/admin/profile` | All | Own profile edit |
| `/admin/users` | ADMIN | Admin user management |
| `/admin/audit` | ADMIN | Audit log viewer |
| `/admin/settings` | ADMIN | Club settings (ClubSettings table) |

---

## COMPLETED FEATURES

- NextAuth v5 credentials authentication (bcrypt password, JWT session, role in token)
- Full CRUD for all 16 admin sections listed above
- Bilingual public site (FR/AR) with RTL layout for Arabic
- `next-intl` routing — `fr` default locale, `ar` secondary, hreflang alternates in metadata
- File uploads with magic-bytes MIME validation
- In-memory rate limiting on tournament registration API
- CSRF origin check on all mutating API routes (`apiAuth.ts`)
- XSS sanitization of blog HTML content (`isomorphic-dompurify`)
- CSP + HSTS + X-Frame-Options + Referrer-Policy headers (`next.config.ts`)
- Skip-to-content accessibility link (public layout)
- JSON-LD `Organization` schema on homepage
- Sitemap + `robots.txt`
- Self-hosted fonts (Inter + Cairo via `next/font` — no external font CDN)
- Tiptap rich-text editor loaded via dynamic import (avoids SSR bundle bloat)
- Admin SPA navigation (AdminShell in `app/admin/layout.tsx` — no full page refresh)
- Role-based dashboards (different stat widgets per role)
- RBAC: middleware route guard + sidebar filtering + API-level `requireRoles()`
- Audit log (CREATE/UPDATE/DELETE actions recorded for ADMIN review)
- Player stats per match (`PlayerStat` model linked to `Match`)
- Cookie consent banner (public site)
- Bundle analyzer (`ANALYZE=true npm run build`)
- Seed scripts: `seed-admin.ts`, `seed-archive.ts`, `seed-league.ts`

---

## PENDING / TODO

- **Cloudinary integration** — photos and files currently stored on local disk (`public/uploads/`); must move to cloud storage before scaling
- **YouTube embed** — no video URL field yet on `Match` or `BlogPost`
- **GalleryAlbum model** — gallery is grouped by a plain `category` string; no dedicated album entity
- **Blog excerpt / SEO description** — `BlogPost` has no `excerpt` field; meta description falls back to generic site description
- **PDF receipt generation** — payments and expenses have no printable receipt export
- **PWA / offline support** — no service worker or manifest
- **Player stats UI** — `PlayerStat` model exists and is linked to `Match`, but admin UI for per-match stat entry may be incomplete

---

## KNOWN ISSUES & DECISIONS

- `prisma/schema.prisma` provider is `sqlite` in the repo — **must change to `mysql` before running on PlanetHoster**. The comment at the top of the file explains the swap.
- `UPLOAD_DIR` defaults to `<project_root>/public/uploads/` — the directory must be created manually on the server (`mkdir -p ~/wshm/public/uploads && chmod 755 ~/wshm/public/uploads`).
- `DATABASE_URL` on PlanetHoster **must use `localhost`**, not `127.0.0.1` — MySQL socket binding differs.
- `npx prisma db push` is used instead of `prisma migrate` — simpler on shared hosting, no migration history needed.
- Admin panel is **French only** — `adminT.ts` provides a lightweight French-only translation helper; `next-intl` is not used in `/admin/`.
- `.env*` files are gitignored (confirmed in `.gitignore`) — never commit secrets.
- Prisma client output is `src/generated/prisma/` (non-default) — also gitignored.
- `unsafe-eval` is kept in CSP `script-src` because Next.js dev mode and some runtime features require it; review before going to production if stricter CSP is desired.
- `SECRETARY` role can access `expenses` and `payments` (unlike the task description which said "no expenses" — the actual `roles.ts` grants it).
