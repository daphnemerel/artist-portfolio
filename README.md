# Artist portfolio

Next.js (App Router) portfolio site. Content lives in `content/` as Markdown and YAML; no CMS or database.

## Development

```sh
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build (validates all content)
pnpm typecheck
```

Requires Node 20+ and pnpm. Set `NEXT_PUBLIC_SITE_URL` in production (used for metadata and the sitemap).

## Content

```
content/
├── site.yaml          # name, description, bio, contact, representation, CV
├── exhibitions.yaml   # solo / group / fair / screening entries
├── texts/*.md         # statement, essays, press, interviews
└── works/<slug>/
    ├── index.md       # frontmatter + optional text
    └── images/        # original images for this work
```

### Adding a work

1. Create `content/works/<slug>/` (the folder name becomes the URL, e.g. `<year>-<artwork-title>`).
2. Put the images in `images/` — full-resolution JPG or PNG, around 2500–3000px on the long side.
   Never crop them for the site; every image is shown at its own proportions.
3. Add `index.md`:

```yaml
---
title: Artwork title
year: Year                 # optional, written as a number
medium: Medium
dimensions: Dimensions     # optional
edition: Edition           # optional
series: Series title       # optional, used for the filter on /works
featured: true             # optional, first featured work leads the home page
order: 1                   # optional, sort within a year (lower first)
draft: false               # optional, hides the work
images:
  - src: ./images/01.jpg
    alt: Description of what is visible in the image   # required
    caption: Image caption                             # optional
    credit: Photo credit                               # optional
---

Optional text about the work (Markdown).
```

### Adding an exhibition

Add an entry to `content/exhibitions.yaml`:

```yaml
- title: Exhibition title
  venue: Exhibition venue
  city: City
  type: solo                # solo | group | fair | screening
  year: Year                # optional, written as a number
  works: [work-folder-name] # optional, links the title to a work
  url: https://…            # optional, links the venue
```

### Adding a text

Add `content/texts/<slug>.md`:

```yaml
---
title: Text title
kind: essay                 # statement | essay | press | interview
author: Author              # optional
publication: Publication    # optional
year: Year                  # optional, written as a number
order: 1                    # optional, position in the list (lower first)
---

Text (Markdown).
```

The build fails with a clear message if a required field, image file or alt text is missing.
Entries without a year are listed last.

Images are copied to `public/media/` (gitignored) by `scripts/sync-images.mjs` before `dev`
and `build`, then served responsively (AVIF/WebP) by `next/image`.

## Design system

- Tokens: `src/styles/tokens.css` — colour (paper, ink, one grey), type scale, spacing scale, layout margins.
- Type: Inter Tight (interface, headings, captions) and Newsreader (long-form texts), self-hosted via `next/font`.
- No border radius, shadows, gradients or accent colours — the artworks carry the colour.
