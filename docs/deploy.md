# Deployment Guide — PlanetHoster World Shared Hosting

W.S.H.M website · Next.js 16 + MySQL · Node.js managed app

> **Panel URL:** [panel.planethoster.com](https://panel.planethoster.com) — PlanetHoster uses their own **World Panel** (not cPanel).

---

## 1. Prerequisites (local machine)

- Node.js 20+ (`node -v`)
- npm (`npm -v`)
- Git (`git --version`)
- FileZilla (or any FTP client) **or** SSH access to the server

---

## 2. First-time setup on PlanetHoster

### 2.1 Create the MySQL database

1. Log in to [panel.planethoster.com](https://panel.planethoster.com).
2. Go to **Hébergement** → select your hosting account → **Bases de données** → **MySQL**.
3. Click **Créer une base de données**:
   - Database name: `wshm_db`
4. Click **Créer un utilisateur**:
   - Username: `wshm_user`
   - Set a strong password (save it — you will need it)
5. Click **Associer** to link the user to the database → grant **Tous les privilèges**.
6. Note down: host (`localhost`), database name, username, password.

> The DB host on PlanetHoster is always `localhost` — do **not** use `127.0.0.1`.

### 2.2 Set up the Node.js app

1. In World Panel → **Hébergement** → your account → **Node.js**.
2. Click **Créer une application** and fill in:

   | Field | Value |
   |---|---|
   | Version Node.js | `20.x` (or latest LTS available) |
   | Mode | `production` |
   | Répertoire de l'application | `wshm` (relative to your home, e.g. `/home/[user]/wshm`) |
   | URL de l'application | `yourdomain.com` (or subdomain) |
   | Fichier de démarrage | `server.js` |

3. Click **Créer**. PlanetHoster automatically proxies the assigned port to your domain — you do not need to configure anything else.

---

## 3. Prepare the local build

```bash
# 1. Copy the example env file
cp .env.example .env.production.local

# 2. Fill in real values (see Section 6 for all variables)
nano .env.production.local

# 3. Verify the build compiles without errors
npm run build
```

If the build succeeds, you are ready to upload.

---

## 4. Upload files to the server

### Option A — FTP (FileZilla)

Connect with your FTP credentials (host: your domain or server IP, port 21).
Find your FTP credentials in World Panel → **Hébergement** → your account → **FTP**.

**Upload** these files/folders to `~/wshm/` on the server:

```
app/
src/
public/
prisma/
scripts/
next.config.ts
tsconfig.json
package.json
package-lock.json
.env                  ← your production env file (rename from .env.production.local)
```

**Do NOT upload:**

```
node_modules/         ← rebuilt on server
.next/                ← rebuilt on server
.git/                 ← not needed on server
.env.local            ← dev-only secrets
```

### Option B — Git (via SSH terminal)

1. In World Panel → **Hébergement** → your account → **Terminal SSH** (or connect via `ssh user@yourdomain.com`).
2. Then:

```bash
cd ~/wshm
git clone https://github.com/your-repo/wshmadagh.git .
cp .env.example .env
nano .env   # fill in production values
```

---

## 5. Server-side setup (SSH terminal)

Open World Panel → **Hébergement** → your account → **Terminal SSH**, then run:

```bash
cd ~/wshm

# Install all dependencies (including devDependencies needed for build)
npm install --production=false

# Generate the Prisma client
npx prisma generate

# ⚠ Before this step — make sure schema.prisma uses mysql (see note below)
# Push schema to MySQL — creates all tables (no migration files needed)
npx prisma db push

# Build the Next.js app for production
npm run build

# Seed the first admin user
npx tsx scripts/seed-admin.ts
```

**⚠ Important — Prisma provider:** Before running on the server, `prisma/schema.prisma` must use `mysql`:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

Change `sqlite` to `mysql` before uploading. You can keep `sqlite` locally in a `.env.local` override and `mysql` in the main schema — or maintain two schema files.

**About `prisma db push`:** Creates/updates all tables in MySQL directly from the schema without migration history files. Ideal for shared hosting.

---

## 6. Set environment variables

The simplest approach on PlanetHoster: place a `.env` file in `~/wshm/` on the server. Next.js loads it automatically at startup.

| Variable | Example value | Notes |
|---|---|---|
| `DATABASE_URL` | `mysql://wshm_user:PASSWORD@localhost:3306/wshm_db` | Use `localhost`, not `127.0.0.1` |
| `NEXTAUTH_SECRET` | `<32-char random string>` | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://yourdomain.com` | No trailing slash |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` | Used in sitemap and SEO |
| `UPLOAD_DIR` | `/home/[user]/wshm/public/uploads` | Optional — leave empty for default |

**Generate `NEXTAUTH_SECRET`:**

```bash
# Run in SSH terminal or locally
openssl rand -base64 32
```

Alternatively, set env vars in World Panel → **Hébergement** → your account → **Node.js** → your app → **Variables d'environnement** (if that section is available in your plan).

---

## 7. Start the app

1. In World Panel → **Hébergement** → your account → **Node.js** → your app.
2. Click **Installer les dépendances NPM** (runs `npm install`).
3. Set startup file to `server.js`.
4. Click **Redémarrer** (or **Démarrer** on first run).
5. Visit your domain — the site should load.

> `server.js` is generated automatically by `npm run build` in the `.next/` directory and copied to the app root by Next.js.

---

## 8. DNS & SSL

### DNS

1. In World Panel → **Hébergement** → your account → **Informations du serveur** — note the server IP.
2. At your domain registrar (or in World Panel → **Domaines**), set an **A record** pointing your domain to that IP.
3. Wait for DNS propagation (up to 24 h, usually under 1 h).

### SSL (Let's Encrypt — free)

1. In World Panel → **Hébergement** → your account → **SSL**.
2. Select your domain → **Let's Encrypt** → **Émettre le certificat**.
3. Enable **Forcer HTTPS** to redirect all HTTP traffic to HTTPS.

> The `Strict-Transport-Security` (HSTS) header is already configured in `next.config.ts` with a 2-year `max-age`. After verifying HTTPS works, you can submit to the [HSTS preload list](https://hstspreload.org).

---

## 9. Uploads directory

The app stores uploaded files in `public/uploads/`. Create it on the server if it does not exist:

**Via World Panel File Manager:**
1. In World Panel → **Hébergement** → your account → **Gestionnaire de fichiers**.
2. Navigate to `wshm/public/`.
3. Create folder `uploads`.
4. Right-click → **Permissions** → set to `755`.

**Via SSH terminal:**

```bash
mkdir -p ~/wshm/public/uploads
chmod 755 ~/wshm/public/uploads
```

> If you later integrate Cloudinary for media storage, this local directory becomes optional (only used as a fallback for non-image documents).

---

## 10. Updating the site (after initial deploy)

```bash
# Local — make changes, verify build passes
npm run build

# Then on the server (SSH terminal):
cd ~/wshm
git pull   # if using git, OR re-upload changed files via FTP

# If schema.prisma changed:
npx prisma db push

# Always restart after any change
# → World Panel → Node.js → your app → Redémarrer
```

**Quick checklist for each update:**

- [ ] Build passes locally (`npm run build`)
- [ ] Files uploaded / `git pull` run on server
- [ ] `npx prisma db push` run if `schema.prisma` changed
- [ ] App restarted in World Panel → Node.js

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| App won't start | Wrong Node.js version or missing env vars | Set Node.js to 20.x in World Panel; verify `.env` file exists |
| `Error: Cannot find module` | `npm install` not run | Run `npm install --production=false` in `~/wshm` via SSH |
| Database connection error | Wrong `DATABASE_URL` | Ensure host is `localhost`; verify username/password match what was set in step 2.1 |
| 502 / 503 gateway error | App crashed | World Panel → **Hébergement** → **Journaux** → check error log; verify `.next/` exists (run build) |
| Images not showing | Missing `public/uploads/` or wrong permissions | Create dir via File Manager, set `chmod 755` |
| Arabic text broken | Font not loading | Self-hosted via `next/font` — no CDN needed, should always work |
| `prisma db push` fails | Schema still set to `sqlite` | Change `provider` to `"mysql"` in `prisma/schema.prisma` |
| Login redirect loop | `NEXTAUTH_URL` mismatch | Set it to the exact public URL with `https://` and no trailing slash |
| Node.js app not visible | App not started | World Panel → Node.js → your app → click **Démarrer** |
