# DevSecOps Practices — W.S.H.M Website

Next.js 16 + Prisma 5 + MySQL · PlanetHoster World Shared Hosting

This file is a living checklist. Mark items as you implement them.

---

## 1. Secret Management

| # | Practice | Status |
|---|---|---|
| 1.1 | Never commit `.env`, `.env.local`, `.env.production` — covered in `.gitignore` | ✅ Done |
| 1.2 | Use `.env.example` with placeholder values as the only committed env template | ✅ Done |
| 1.3 | `NEXTAUTH_SECRET` must be ≥ 32 random bytes — generate with `openssl rand -base64 32` | ✅ Documented |
| 1.4 | Rotate `NEXTAUTH_SECRET` if ever exposed — all active sessions invalidate immediately | ⬜ Procedure |
| 1.5 | Store production secrets in PlanetHoster World Panel → Node.js → Variables d'environnement, not in a flat `.env` file on disk if the option is available in your plan | ⬜ Check |
| 1.6 | DB password: use a dedicated `wshm_user` account with only the permissions it needs (SELECT, INSERT, UPDATE, DELETE on `wshm_db` only — no GRANT, DROP, or FILE) | ⬜ Apply |
| 1.7 | Never log secrets — audit all `console.log` calls before each production deploy | ⬜ Pre-deploy |

**If a secret leaks:**
1. Rotate it immediately (new DB password, new NEXTAUTH_SECRET).
2. Restart the Node.js app in World Panel.
3. Review server access logs for suspicious activity.
4. Notify affected users if session data may have been compromised.

---

## 2. Dependency Security

| # | Practice | Status |
|---|---|---|
| 2.1 | Run `npm audit` before every production deploy — fix `high` and `critical` findings | ⬜ Pre-deploy |
| 2.2 | Keep `package-lock.json` committed so installs are reproducible | ✅ Done |
| 2.3 | Pin Node.js version: add `"engines": { "node": ">=20.0.0" }` to `package.json` | ⬜ Add |
| 2.4 | Review `npm outdated` quarterly — update minor/patch versions after testing locally | ⬜ Quarterly |
| 2.5 | Enable GitHub Dependabot alerts once the repo is on GitHub (Settings → Security → Dependabot) | ⬜ GitHub |
| 2.6 | Avoid packages with < 100 weekly downloads or last published > 2 years ago | ⬜ Review |

---

## 3. CI/CD Pipeline Security Gates

Add these checks to GitHub Actions (or any CI) before merging to `main`:

```yaml
# .github/workflows/ci.yml (future)
name: CI
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm audit --audit-level=high   # fail on high/critical vulns
      - run: npx prisma validate            # schema syntax check
      - run: npm run build                  # type-check + build
      - run: npx eslint . --max-warnings=0  # no linting regressions
```

| # | Gate | Priority |
|---|---|---|
| 3.1 | `npm audit --audit-level=high` — block merge on high/critical CVEs | High |
| 3.2 | `npx prisma validate` — catch schema errors before deploy | High |
| 3.3 | `npm run build` — TypeScript compilation must succeed | High |
| 3.4 | ESLint with `eslint-plugin-security` — catch obvious security anti-patterns | Medium |
| 3.5 | Secret scanning — add `trufflesecurity/trufflehog` action to catch committed secrets | Medium |

---

## 4. Branch Protection (GitHub)

Once the repo is on GitHub, apply these rules to `main`:

- [x] **Require pull request before merging** (no direct push to main)
- [x] **Require at least 1 approving review**
- [x] **Require status checks to pass** (CI workflow above)
- [x] **Disallow force push** to main
- [x] **Disallow branch deletion** for main

**Why:** Prevents accidental or malicious direct commits to the production branch.

---

## 5. Static Analysis (SAST)

| # | Tool | What it catches |
|---|---|---|
| 5.1 | `eslint-plugin-security` | `eval()`, `child_process`, regex DoS, unsafe `innerHTML` patterns |
| 5.2 | TypeScript strict mode (`"strict": true` in `tsconfig.json`) | Null dereferences, implicit `any` types | 
| 5.3 | `@next/eslint-plugin-next` | Next.js-specific anti-patterns |

Install SAST plugin:
```bash
npm install --save-dev eslint-plugin-security
```

Add to `.eslintrc.json`:
```json
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"]
}
```

---

## 6. Hosting & Server Security (PlanetHoster)

| # | Practice | Status |
|---|---|---|
| 6.1 | Node.js version pinned to `20.x` in World Panel — never use "latest" in production | ⬜ Check |
| 6.2 | `public/uploads/` permissions: `755` (owner can write, others read-only) | ⬜ Check |
| 6.3 | App directory `~/wshm/` permissions: `700` (owner only) for config files | ⬜ Check |
| 6.4 | `.env` file on server: `600` (owner read/write, no group/world access) — `chmod 600 .env` | ⬜ Apply |
| 6.5 | SSL: Let's Encrypt cert issued, HTTPS forced in World Panel | ⬜ Deploy |
| 6.6 | HSTS header configured in `next.config.ts` with `max-age=63072000` (2 years) | ✅ Done |
| 6.7 | Disable directory listing — confirm World Panel does this by default for Node.js apps | ⬜ Check |
| 6.8 | Keep PlanetHoster account 2FA enabled (World Panel account settings) | ⬜ Verify |
| 6.9 | FTP access: use SFTP over FTP when available; revoke FTP accounts that are no longer needed | ⬜ Verify |

---

## 7. Authentication & Session Security

| # | Practice | Status |
|---|---|---|
| 7.1 | Passwords hashed with bcrypt, cost factor 12 | ✅ Done |
| 7.2 | `NEXTAUTH_SECRET` is random and ≥ 32 bytes | ✅ Documented |
| 7.3 | Session expires after 24 h (NextAuth default) — review in `auth.ts` if shorter is preferred | ⬜ Review |
| 7.4 | No password reset via email yet — add only when SMTP is configured and tested | ⬜ Future |
| 7.5 | Admin login rate-limit: add per-IP brute-force protection on `/api/auth/callback/credentials` | ⬜ Future |
| 7.6 | Audit admin user list quarterly — remove accounts for departed staff | ⬜ Quarterly |
| 7.7 | Enforce minimum password length (12 chars) in the admin user creation form | ⬜ Add |

---

## 8. API Security

All items already implemented or their current state:

| # | Control | Status |
|---|---|---|
| 8.1 | CSRF: `checkOrigin()` in `apiAuth.ts` rejects cross-origin state-mutating requests (production only) | ✅ Done |
| 8.2 | RBAC: `requireRoles()` wrapper on every API route that mutates data | ✅ Done |
| 8.3 | Rate limiting: in-memory 5 registrations/IP/hour on tournament registration endpoint | ✅ Done |
| 8.4 | File upload validation: magic bytes check (JPEG, PNG, WebP, GIF, PDF) + 5 MB size limit | ✅ Done |
| 8.5 | XSS: `isomorphic-dompurify` sanitizes all blog HTML before rendering | ✅ Done |
| 8.6 | SQL injection: Prisma parameterized queries — no raw SQL with user input | ✅ Done |
| 8.7 | Input length limits: add `maxLength` validation on all text API inputs (names, slugs, etc.) | ⬜ Harden |
| 8.8 | Content-Type enforcement: reject requests without `Content-Type: application/json` on JSON endpoints | ⬜ Harden |
| 8.9 | API responses: never return stack traces or Prisma error details to clients in production | ⬜ Verify |

---

## 9. Database Security

| # | Practice | Status |
|---|---|---|
| 9.1 | Use a dedicated `wshm_user` DB account — not the MySQL root account | ⬜ Apply |
| 9.2 | Grant only: `SELECT, INSERT, UPDATE, DELETE` on `wshm_db.*` — no administrative privileges | ⬜ Apply |
| 9.3 | DB password ≥ 20 chars, random, stored only in the server `.env` file | ⬜ Apply |
| 9.4 | Enable MySQL binary logs on PlanetHoster if available — enables point-in-time recovery | ⬜ Check |
| 9.5 | Manual DB dump before every schema migration: `mysqldump -u wshm_user -p wshm_db > backup.sql` | ⬜ Pre-deploy |
| 9.6 | Weekly automated backup: schedule a World Panel cron job to dump and compress the DB | ⬜ Schedule |
| 9.7 | Backup retention: keep 30 days of daily dumps, stored off-server (download locally or to Google Drive) | ⬜ Schedule |
| 9.8 | Test restoring a backup at least once per quarter | ⬜ Quarterly |

**Backup cron command (World Panel → Hébergement → Tâches planifiées):**
```bash
mysqldump -u wshm_user -p'YOUR_PASSWORD' wshm_db | gzip > ~/backups/wshm_$(date +%F).sql.gz
```

---

## 10. HTTP Security Headers

Already configured in `next.config.ts`:

| Header | Value | Status |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ |
| `X-Frame-Options` | `SAMEORIGIN` | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | camera, microphone, geolocation denied | ✅ |
| `Content-Security-Policy` | Configured, review `img-src` and `script-src` after any new third-party integration | ✅ Review |

**To verify headers in production:**
```bash
curl -I https://wshm.ma
```
Or use [securityheaders.com](https://securityheaders.com).

---

## 11. Monitoring & Alerting

| # | Practice | Status |
|---|---|---|
| 11.1 | Uptime monitoring: set up a free monitor at UptimeRobot or BetterStack targeting `https://wshm.ma` — alert via email if the site goes down | ⬜ Setup |
| 11.2 | Error logging: review World Panel → Hébergement → Journaux weekly for 5xx errors | ⬜ Weekly |
| 11.3 | Failed login attempts: log them to a separate table or log file; alert if > 10 failures/hour on the same IP | ⬜ Future |
| 11.4 | DB size monitoring: check `wshm_db` size in World Panel monthly to avoid quota issues | ⬜ Monthly |
| 11.5 | Disk quota: monitor `public/uploads/` growth — PlanetHoster shared plans have disk limits | ⬜ Monthly |

---

## 12. Privacy & GDPR Compliance

| # | Requirement | Status |
|---|---|---|
| 12.1 | Cookie consent banner: localStorage-based, no tracking cookies set before consent | ✅ Done |
| 12.2 | Privacy policy page (`/fr/privacy`, `/ar/privacy`) in both languages | ✅ Done |
| 12.3 | No third-party analytics (Google Analytics, Meta Pixel) — no personal data sent off-site | ✅ Done |
| 12.4 | Tournament registration form collects: club name, contact name, phone, email — stored in DB only | ✅ Done |
| 12.5 | Data retention: define how long tournament registration data is kept — recommend 2 seasons, then delete | ⬜ Policy |
| 12.6 | Right to erasure: if a registrant emails to request deletion, delete their row from `TournamentRegistration` | ⬜ Procedure |
| 12.7 | Player data: `licenseNumber`, `birthDate`, `phone` are PII — restrict access to ADMIN/SECRETARY only | ✅ RBAC |
| 12.8 | Payment records: kept for 5 years minimum for accounting/legal compliance (Morocco law) | ⬜ Policy |

---

## 13. Incident Response

**If the site is defaced or hacked:**
1. Take the Node.js app offline immediately (World Panel → Node.js → Arrêter).
2. Take a snapshot of the current server state (file manager, logs).
3. Change: DB password, `NEXTAUTH_SECRET`, FTP password, World Panel account password.
4. Review server logs for the attack vector.
5. Restore from last known-good backup.
6. Patch the vulnerability before bringing the app back online.
7. Notify affected users if personal data was accessed.

**If DB credentials are compromised:**
1. Immediately revoke `wshm_user` in World Panel → MySQL.
2. Create a new DB user with a new password.
3. Update `.env` on the server.
4. Restart the Node.js app.

**Contact:** PlanetHoster support — [support.planethoster.com](https://support.planethoster.com) (available 24/7).

---

## 14. Pre-Deploy Security Checklist

Run before every production deployment:

```
[ ] npm audit --audit-level=high   → 0 high/critical findings
[ ] npm run build                  → no TypeScript errors
[ ] .env not committed             → git status shows no .env files
[ ] NEXTAUTH_SECRET is set         → check server .env
[ ] DB backup taken                → mysqldump before schema changes
[ ] npx prisma validate            → schema is valid
[ ] File permissions checked       → .env is 600, uploads/ is 755
[ ] Node.js version is 20.x        → World Panel → Node.js
[ ] HTTPS is active                → curl -I https://wshm.ma shows 200
[ ] Admin login tested             → /admin/login works after restart
```

---

## Future Security Roadmap

| Item | Priority | When |
|---|---|---|
| Add `eslint-plugin-security` to CI | Medium | Next sprint |
| GitHub Actions CI pipeline (npm audit + build) | High | After GitHub push |
| Dependabot alerts on GitHub | Medium | After GitHub push |
| Brute-force protection on admin login | Medium | Before public launch |
| Minimum password length enforcement (12 chars) | Low | Next sprint |
| Automated weekly DB backup cron | High | After deploy |
| UptimeRobot monitor on wshm.ma | High | After deploy |
| Email alerting for failed logins | Low | Post-launch |
| HSTS preload list submission | Low | 6 months after launch |
| Cloudinary signed uploads (replace local disk) | Medium | When storage grows |
