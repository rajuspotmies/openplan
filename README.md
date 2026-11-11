# OpenPlan AI — website

Marketing site for OpenPlan AI, built with Next.js (App Router), React 19, Tailwind CSS v3, shadcn/ui and Framer Motion.
Ported from the previous Vite + React Router site (`hardcraft-suite`), keeping its design and content.

## Getting started

```sh
npm install
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Environment variables

| Name | Used by |
| --- | --- |
| `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` | Form submissions (`src/lib/googleSheets.ts`) |
| `NEXT_PUBLIC_GOOGLE_SHEETS_WAITLIST_URL` | Waitlist form |
| `NEXT_PUBLIC_GOOGLE_SHEETS_DEMO_URL` | Demo request form |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile captcha (`src/components/CaptchaField.tsx`) |

These were `VITE_*` in the old site; rename them in your hosting provider's settings.

## Project layout

```
src/
  app/          Routes (one page.tsx per URL), root layout, metadata, global CSS
  views/        Page components from the old site, rendered by the routes
  components/   Sections, navigation, footer, shadcn/ui primitives
  lib/          Helpers; lib/router.ts maps the old useNavigate/useLocation onto Next's router
  hooks/
public/
  assets/       Images that were imported from src/assets in the old site
```

Routes: `/`, `/about`, `/contact`, `/docs`, `/customers`, `/waitlist`, `/blogs`, `/terms`, `/privacy`, `/security`,
`/industries/{medtech,drone,automotive,consumer-electronics}`, plus the unindexed test pages `/test-video` and `/test-rover-anatomy`.
