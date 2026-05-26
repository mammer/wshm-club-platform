# W.S.H.M — Wefak Sportif Hassanyat Madagh

Site officiel du club de football **Wefak Sportif Hassanyat Madagh**, fondé en 1956 à Madagh, Province de Berkane, Maroc.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | MySQL (prod) / SQLite (dev) via Prisma 5 |
| Auth | NextAuth.js v5 |
| Styling | Tailwind CSS v4 |
| i18n | next-intl — Français + العربية (RTL) |
| Rich text | Tiptap |
| Hosting | PlanetHoster World (Node.js + MySQL) |

## Getting started

```bash
git clone https://github.com/your-org/wshmadagh.git
cd wshmadagh
npm install
cp .env.example .env   # then fill in your values
npx prisma generate
npx prisma db push
npx tsx scripts/seed-admin.ts
npm run dev
```

- Public site → http://localhost:3000/fr
- Admin panel → http://localhost:3000/admin

## Roles

| Role | Access |
|---|---|
| ADMIN | Everything |
| SECRETARY | All except users / audit / settings |
| COACH | Players, coaches, attendance, scores |
| AUTHOR | Blog, gallery |

## Deployment

See [DEPLOY.md](./DEPLOY.md) for the full PlanetHoster World Panel guide.

## Environment variables

See [.env.example](./.env.example) — copy to `.env` and fill in real values before running.

---

Club: Madagh, Province de Berkane, Maroc · Fondé: 1956
