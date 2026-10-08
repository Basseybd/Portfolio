# basseyduke.io design system

Bassey Duke is a senior software engineer in New York who takes photos on the
side. The site has one job: make people say "he has taste." Most visitors
arrive from Instagram and LinkedIn on a phone, often inside the Instagram
in-app browser (iOS WebKit).

## Structure

- `/` First visit of a session: the chroma preloader ("BASSEY" tumbling
  through a cube, a counter to 100%, liquid chrome behind it). Then the landing:
  two doors, **Work** and **Life**, each a pixel abstract. Hover wakes the
  pixels; a click floods the screen and carries you through.
- `/work` The sleek portfolio, kept close to the original: hero with the glyph
  portrait, selected work, pinned experience timeline, services, the toolkit
  (side builds show above it only when `sideBuilds` has entries), a short Off
  the clock band that points to `/life`, contact with the orb.
- `/life` Quick and short. Opens on the deck's top print full bleed, credited
  "Photos by Bassey Duke." with his face beside it; scrolling shrinks it into
  the deck (`LifeIntro`, transform only, skipped for reduced motion). The lead
  print is a place (`life.leadPhoto`) so the first screen never reads as a photo
  of him. Then his portrait and "Hey, I'm Bassey.", links to `/photos` and
  @bassey.jpeg, a one-line "Book a shoot", and a line pointing to OTL. On phones
  with motion on, the deck comes before the hello.
- `/photos` Full archive (all photos, filters, lightbox). `?c=` keeps the filter
  and `?p=` the open photo in the URL.

## Tokens (tailwind.config.ts)

| Token | Hex | Use |
|---|---|---|
| ground | #E3E4E2 | page background (pale silver) |
| paper | #EFF0EE | raised light surfaces |
| ink | #141516 | primary text on light |
| stone | #585B5E | secondary text on light |
| rule | #C5C7C8 | hairlines on light |
| graphite | #17181A | dark sections, doors, `/life` |
| graphite-rule | #34363A | hairlines on dark |
| rice | #ECEDEB | primary text on dark |
| silver | #A7ABAF | secondary text on dark |
| chrome-light | #C9CDD1 | accents on dark |
| alu | #D4D7DA | brushed aluminum panel |
| steel | #4A4D50 | secondary text on aluminum |

Chrome utilities in `app/globals.css`: `.chrome` (horizontal polished bar),
`.chrome-v` (vertical), `.chrome-bezel` (frame), `.btn-chrome` (button),
`.brushed` (aluminum panel).

Color comes only from the photos. Each photo has an `accent` in
`lib/content.ts`, used for the Life flood (taken a little toward graphite).
Never green UI. Never the old cream, terracotta, or burnt orange.

## Type

- Display: Shippori Mincho 400/500 (`font-display`), including the door words.
- Text: Zen Kaku Gothic New 400/500/700 (`font-sans`).
- Data only (stacks, camera settings, counters): Fragment Mono (`font-mono`).
- Preloader letters only: Saira Extra Condensed 800.
- All fonts are self-hosted through Fontsource. Never load Google Fonts at runtime.

## Rules

- No em dashes anywhere, in copy or comments. Use periods or commas.
- Copy is short, plain, sentence case. Bassey's voice: casual, confident.
  Photos are trips, dinners with friends, and New York after dark.
- Capital One work stays public-safe: no internal names, no internal numbers,
  the AI assistant's users are just "users".
- Mobile first: every component must work at 390x844 with touch, no horizontal
  page scroll, 44px touch targets.
- Motion: respect `prefers-reduced-motion` with a static fallback. Pause
  offscreen work (IntersectionObserver). No scroll traps.
- The preloader plays once per session, never on a client navigation, and can
  always be skipped with a tap or a key.
- WebGL must fall back gracefully (show a CSS chrome sheen or the image).
- Images come from `public/photos/{slug}-{640|1200|2400}.webp` via
  `photoSrc` / `photoSrcSet` in `lib/content.ts`. Always set width and height.
- No eyebrows or kickers above headings, no 01 / 02 numbering unless the
  content really is a sequence, no unicode arrows or emoji as icons (draw SVG).
- Accessibility: visible focus, labelled controls, alt text from content.
- Commit messages: no co-author trailers.
