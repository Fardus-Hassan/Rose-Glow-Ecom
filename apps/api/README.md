# Rose Glow API

NestJS + Prisma + PostgreSQL backend for the Rose Glow storefront and admin.

## Stack

- NestJS 11
- Prisma 6 + PostgreSQL
- JWT auth (admin/staff)
- Bilingual content (EN/BN) + SEO fields on products, categories, pages

## Setup

```bash
# from repo root
pnpm db:up
pnpm --filter api prisma:migrate
pnpm db:seed
pnpm dev:api
```

API: `http://localhost:4000/api`  
Health: `GET /api/health`

Postgres (Docker) maps to **localhost:5436**.

## Admin credentials (seed)

- Email: `rose.glow.bd@gmail.com`
- Password: from `ADMIN_PASSWORD` in `.env` (local default set in seed env)

## Key routes

| Area | Path |
|------|------|
| Login | `POST /api/auth/login` |
| Dashboard | `GET /api/admin/dashboard` |
| Products | `/api/products`, `/api/admin/products` |
| Orders | `POST /api/orders`, `/api/admin/orders` |
| Content CMS | `/api/admin/content/blocks`, `/api/admin/pages` |
| SEO | `/api/seo?path=/`, `/api/admin/seo` |
| Reviews | `/api/reviews`, `/api/admin/reviews` |

Admin UI: `apps/admin` on port **3002**.
