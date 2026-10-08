# Portfolio

The code behind [basseyduke.io](https://basseyduke.io). Work on one side, photos on the other.

Next.js 15 · React 19 · TypeScript · Tailwind · Vercel

## Pages

- `/` the intro and the Work and Life doors
- `/work` the portfolio
- `/life` photos, quick and short
- `/photos` the full archive

## Editing

- Copy, links and photos live in `lib/content.ts`. Edit there, not in components.
- The look and the rules live in `DESIGN.md`.
- To add a photo, drop `{slug}-640.webp`, `-1200.webp` and `-2400.webp` into `public/photos` and add an entry to `photos`. `featured: true` puts it on the Life door and deck.

## Run it

```bash
npm install
npm run dev
```

## Check it

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e   # Playwright, desktop and phone, against the build
```

CI (`.github/workflows/ci.yml`) runs all four on every PR as one `checks` job, and `main` requires it to pass. Auto-merge is on for the repo: content fixes, new photos and dependency bumps can merge themselves once `checks` passes. Anything visual or motion-related waits for a look at the Vercel preview on a phone first.

Deploys to Vercel from `main` on Node 24. The contact form runs on Formspree.
