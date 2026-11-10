# Rose Glow E-commerce

Monorepo for **Rose Glow** ladies ornaments — storefront, NestJS API, and admin dashboard.

## Stack

- **Storefront** (`apps/web`) — Next.js App Router, Tailwind, next-intl (`bn` + `en`), GSAP + Lenis
- **API** (`apps/api`) — NestJS 11, Prisma, PostgreSQL, JWT admin auth
- **Admin** (`apps/admin`) — Next.js dashboard (orders, products, CMS, SEO)
- pnpm workspaces + Turborepo + Docker Compose (Postgres)

## Develop

```bash
pnpm install
pnpm db:up
pnpm --filter api prisma:migrate
pnpm db:seed

# terminals
pnpm dev:api     # http://localhost:4000/api
pnpm --filter web dev   # http://localhost:3001
pnpm dev:admin   # http://localhost:3002
```

### Admin login (seed)

- Email: `rose.glow.bd@gmail.com`
- Password: `rose.glow.bd2026` (override via `apps/api/.env`)

### Postgres

Docker service maps to **localhost:5436** (avoids clashing with other local DBs on 5432).

## Apps

| App | Port | Role |
|-----|------|------|
| web | 3001 | Customer storefront |
| api | 4000 | REST API + admin endpoints |
| admin | 3002 | CMS / orders / SEO dashboard |

## Storefront pages

- `/[locale]` — Home
- `/[locale]/products` — Shop
- `/[locale]/product/[slug]` — Product details
- `/[locale]/about`, `/contact`, `/cart`, `/wishlist`, `/search`
