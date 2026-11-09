# Rose Glow E-commerce

Frontend-first monorepo for **Rose Glow** ladies ornaments shop.

## Stack

- Next.js (App Router) + Tailwind CSS
- next-intl (`bn` + `en`)
- GSAP + Lenis smooth scroll
- pnpm workspaces + Turborepo

## Develop

```bash
pnpm install
pnpm --filter web dev
```

Open [http://localhost:3001/bn](http://localhost:3001/bn)

> On this Windows machine, native SWC/Turbopack binaries may be blocked by Application Control. The default `dev` script uses Webpack + WASM, and Tailwind v3 (explicit content paths) for reliable CSS.

## Current pages

- `/[locale]` — Home
- `/[locale]/products` — Products
- `/[locale]/product/[slug]` — Product details (image + video gallery)
