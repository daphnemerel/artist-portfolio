# Daphne Merel — Website Design Codebook
Version 1.0

## 1. Purpose
This document is the single source of truth for the Daphne Merel artist website.

The website must feel like a contemporary exhibition catalogue: artistic, warm, quiet, editorial, image-led, and spacious. The artwork is always the primary visual focus. The interface must never look like a SaaS product, corporate portfolio, generic template, or online shop unless explicitly requested later.

Claude Code should read this document before making any visual or structural changes.

---

## 2. Brand principles

### Core feeling
- Contemporary art gallery
- Editorial / exhibition catalogue
- Warm and tactile
- Quiet confidence
- Personal, not commercial
- Asymmetrical but intentional
- Spacious
- Image-led
- Refined rather than luxurious
- Distinctive without decorative clutter

### Avoid
- SaaS cards
- Generic template sections
- Gradients
- Glassmorphism
- Large drop shadows
- Pill-shaped buttons everywhere
- Excessive rounded corners
- Neon colors
- Stock-photo aesthetics
- Heavy animation
- Parallax / scroll-jacking
- Oversized marketing CTAs
- Marketing phrases such as “Discover”, “Explore”, “Journey”, “Unlock”
- Cropping artwork merely to make a grid uniform

---

# 3. Color system

These colors are fixed brand tokens. Do not invent additional brand colors unless explicitly requested.

| Token | Name | HEX | Role |
|---|---|---|---|
| `--color-bordeaux` | Bordeaux | `#6A2E3B` | Primary brand color; headings, selected states, fine rules, important typographic accents |
| `--color-pink` | Roze | `#D79A9A` | Warm secondary color; subtle surfaces, selected editorial accents, gentle hover moments |
| `--color-turquoise` | Turquoise | `#5FAEAD` | Contrast accent; links, subtle interactive states, occasional graphic details |
| `--color-off-white` | Wit | `#F6F1EC` | Main page background |
| `--color-ink` | Ink | `#1C1718` | Primary text and near-black interface color |

Recommended CSS:

```css
:root {
  --color-bordeaux: #6A2E3B;
  --color-pink: #D79A9A;
  --color-turquoise: #5FAEAD;
  --color-off-white: #F6F1EC;
  --color-ink: #1C1718;
}
```

### Color usage
- Default page background: `--color-off-white`
- Default body text: `--color-ink`
- Bordeaux is the strongest brand color.
- Pink is warm and atmospheric, never candy-like.
- Turquoise is an accent, not a dominant page background.
- Artwork provides much of the website's visual color; UI colors should not compete with it.
- Maintain accessible contrast for text.
- Never apply color filters or overlays to artwork.

Suggested approximate balance:
- 65–75% off-white / neutral space
- 15–20% ink / typography
- 5–10% bordeaux
- 2–5% pink
- 1–3% turquoise

This is guidance, not a rigid formula.

---

# 4. Typography

## Current font system
The current design system uses system-safe fonts:

- Sans-serif: **Arial**
- Serif: **Georgia**

If custom fonts are added later, the preferred direction is:
- Arial → **Manrope**
- Georgia → **Newsreader**

Do not change fonts unless explicitly requested.

## Type tokens

| Token | Font | Weight | Size | Line height | Letter spacing | Use |
|---|---|---:|---:|---:|---:|---|
| `display-xl` | Arial | Regular / 400 | 88px | 0.95 | -0.035em | Artist name and very large homepage titles only |
| `heading-lg` | Arial | Regular / 400 | 48px | 1.05 | -0.025em | Main page headings: Works, About, Exhibitions |
| `heading-md` | Arial | Regular / 400 | 28px | 1.15 | -0.015em | Artwork titles and section headings |
| `body-lg` | Georgia | Regular / 400 | 28px | 1.35 | 0 | Artist statement, introduction, highlighted editorial text |
| `body` | Georgia | Regular / 400 | 17px | 1.55 | 0 | Bio, project descriptions, long-form reading |
| `nav` | Arial | Regular / 400 | 14px | 1.2 | 0.02em | Main navigation |
| `caption` | Arial | Regular / 400 | 13px | 1.4 | 0.02em | Year, medium, dimensions, credits, metadata |

Recommended CSS variables:

```css
:root {
  --font-sans: Arial, Helvetica, sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;

  --type-display-xl: 88px;
  --type-heading-lg: 48px;
  --type-heading-md: 28px;
  --type-body-lg: 28px;
  --type-body: 17px;
  --type-nav: 14px;
  --type-caption: 13px;
}
```

### Typography rules
- Maximum two font families.
- Do not rely on bold weight for hierarchy. Size, placement, whitespace, and font-family contrast create hierarchy.
- Avoid excessive uppercase.
- Long-form prose should have a readable measure of roughly **55–70 characters per line**.
- Body copy must never span the full desktop viewport.
- Captions and metadata should feel factual and restrained.
- The artist's name may be large, but should never visually overpower the artwork for an entire page.
- Use typographic contrast sparingly and intentionally.

### Responsive type
Use `clamp()` so sizes scale gracefully.

Suggested starting points:

```css
.display-xl {
  font-size: clamp(3.5rem, 8vw, 5.5rem);
}

.heading-lg {
  font-size: clamp(2.25rem, 5vw, 3rem);
}

.heading-md {
  font-size: clamp(1.5rem, 3vw, 1.75rem);
}
```

---

# 5. Spacing

The website uses a deliberate spacing scale.

| Token | Value | Use |
|---|---:|---|
| `space-xs` | 8px | Labels, captions, tightly related metadata |
| `space-sm` | 16px | Small internal spacing |
| `space-md` | 24px | Default gap between related elements |
| `space-lg` | 40px | Between small sections / groups |
| `space-xl` | 64px | Large section spacing |
| `space-2xl` | 104px | Major section separation |
| `space-3xl` | 168px | Large gallery-like breathing room; desktop, used sparingly |

Recommended CSS:

```css
:root {
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 40px;
  --space-xl: 64px;
  --space-2xl: 104px;
  --space-3xl: 168px;
}
```

### Spacing rules
- Whitespace is an active design element.
- Major sections should normally have 104–168px vertical separation on desktop.
- Mobile spacing may reduce proportionally, but the site must still feel spacious.
- Avoid squeezing content into dense containers.
- Related metadata remains close together; unrelated editorial sections remain clearly separated.

---

# 6. Grid and layout

## Desktop
- Use a **12-column grid**.
- Outer horizontal page margin: approximately **6vw**.
- Maximum content width may be used when helpful, but the design should not look like one centered boxed container.
- Allow asymmetrical composition.
- Text commonly occupies columns 1–4 or 1–5.
- Artwork can occupy columns 5–12, 6–12, or other intentionally asymmetric ranges.
- Some artwork may break the normal alignment where composition benefits.
- Maintain meaningful negative space.

Suggested foundation:

```css
.page-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: clamp(16px, 2vw, 32px);
  padding-inline: 6vw;
}
```

## Tablet
- 8-column grid.
- Approx. 5vw horizontal margins.
- Preserve asymmetry where possible without reducing legibility.

## Mobile
- 4-column or simple single-column flow.
- Approx. 20–24px horizontal page padding.
- Artwork typically becomes full content width.
- Never allow horizontal scrolling.
- Do not hide essential artwork metadata.
- Navigation may become a simple text toggle/menu.

## Layout philosophy
- No repetitive card grid as the default layout.
- Pages should feel composed, not templated.
- Think in spreads, sequences, pauses, and image rhythm.
- The layout may vary between projects if this supports the artwork, while still using the same type/color/spacing system.

---

# 7. Corner radius

The visual language is mostly sharp-edged.

| Token | Value | Use |
|---|---:|---|
| `radius-none` | 0px | Artwork, sections, normal content, most controls |
| `radius-sm` | 4px | Only tiny functional UI elements if needed |

Rules:
- Artwork always uses `0px`.
- Do not make content cards with large rounded corners.
- Do not use pill-shaped buttons unless there is a specific functional reason.

```css
:root {
  --radius-none: 0px;
  --radius-sm: 4px;
}
```

---

# 8. Shadows and elevation

Default: **no shadows**.

Artwork, sections, navigation, buttons, and standard content should not cast shadows.

One optional functional shadow may be used only for temporary overlays or modals:

```css
--shadow-overlay: 0 2px 12px rgba(28, 23, 24, 0.06);
```

Never use this shadow for:
- artworks
- section containers
- ordinary cards
- navigation bars
- decorative elevation

Use spacing, rules, typography, and color rather than elevation.

---

# 9. Borders and rules

Borders should resemble editorial hairlines.

```css
--border-hairline: 1px solid rgba(28, 23, 24, 0.22);
```

Rules:
- Use sparingly.
- Useful for metadata rows, exhibition lists, navigation separators, or structural distinctions.
- Avoid boxing every section.
- Never put a visible border around artwork unless it is part of the artwork/documentation itself.

---

# 10. Wordmark / logo

## Primary wordmark
The primary identity is the artist's name:

**Daphne Merel**

Direction:
- Typographic wordmark, not an elaborate graphic logo.
- Generous clear space around it.
- Prefer regular type weight.
- May appear large on the homepage.
- Must work in Ink and Bordeaux.
- Do not add decorative effects, outlines, shadows, gradients, or textures to the wordmark.

## Secondary mark
A small **DM** monogram can be developed later if needed.

Do not invent a monogram without explicit approval.

---

# 11. Artwork presentation

Artwork is the most important content.

Rules:
- Preserve original aspect ratio.
- Never crop merely to force equal thumbnails.
- No rounded corners.
- No color filters.
- No dark overlays.
- Avoid text sitting over artwork.
- Use high-quality responsive images.
- Use `next/image` where appropriate.
- Prevent layout shift by providing image dimensions/aspect ratio.
- Lazy-load below-the-fold work.
- Featured above-the-fold imagery should load promptly.
- Alt text must describe the work/image meaningfully.
- Captions sit outside the image.
- Give images enough space to be viewed as works, not product cards.

## Artwork metadata order
Preferred:

1. Title
2. Year
3. Medium
4. Dimensions
5. Edition, if applicable
6. Installation / photography credit, if applicable

Example:

```text
Untitled (Field)
2026
Oil and mixed media on linen
180 × 140 cm
```

## Project pages
Prefer a vertical image sequence:
- lead artwork / installation view
- details
- secondary works
- optional text
- metadata
- previous / next project navigation

Do not default to small thumbnail galleries.

---

# 12. Interaction

Interaction is subtle and secondary to the art.

## Links
- Default: Ink or Bordeaux.
- Hover may transition to Turquoise or Bordeaux depending on context.
- Text links may use a subtle underline.
- Keep transitions around 150–250ms.

Example:

```css
a {
  color: var(--color-ink);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
  transition: color 180ms ease;
}

a:hover {
  color: var(--color-turquoise);
}
```

## Artwork hover
If a hover treatment is used:
- very slight scale only: max `1.01`
- no dramatic zoom
- no overlay copy unless explicitly approved

## Motion
Allowed:
- soft image fade-in
- subtle opacity transitions
- understated link transitions
- gentle page content entrance if it does not delay access

Avoid:
- parallax
- scroll-jacking
- bouncing
- continuous decorative movement
- dramatic page transitions
- cursor gimmicks by default

Honor:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# 13. Buttons

The website should rely mainly on text links rather than large CTA buttons.

If a button is needed:
- rectangular or nearly square corners
- no shadow
- 1px hairline border
- transparent/off-white default
- restrained hover
- use sans-serif `nav` style
- comfortable but not oversized padding

Primary button example:

```css
.button {
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-none);
  background: transparent;
  color: var(--color-ink);
  padding: 12px 18px;
  font: 400 var(--type-nav)/1.2 var(--font-sans);
  transition: background-color 180ms ease, color 180ms ease;
}

.button:hover {
  background: var(--color-bordeaux);
  color: var(--color-off-white);
}
```

Avoid:
- giant rounded CTA buttons
- gradients
- shadows
- multiple competing button styles

---

# 14. Navigation

Desktop:
- A single calm line of text links.
- Artist name / wordmark on the left.
- Main links on the right or arranged with intentional editorial spacing.

Core navigation:
- Works
- Exhibitions
- About
- Contact

Optional later:
- Texts / Journal

Mobile:
- Keep it text-based and minimal.
- A simple “Menu” / “Close” toggle is preferred over an overly styled icon system.
- Menu should be keyboard accessible.

Navigation should never dominate the artwork.

---

# 15. Page architecture

## Home `/`
Purpose: establish identity and show selected work immediately.

Suggested rhythm:
1. Daphne Merel wordmark/name
2. Featured artwork or installation image
3. Selected Works
4. Short artist statement / introduction
5. Selected exhibitions or current exhibition
6. Contact / footer

Rules:
- Do not fill the homepage with every project.
- Give the first work visual importance.
- Avoid a conventional corporate hero with button + sales copy.

## Works `/works`
- Image-led index.
- Preserve mixed aspect ratios.
- Optional image/list toggle only if it remains visually quiet.
- Filters by year/series only when there is enough work to justify them.
- No e-commerce product-card layout.

## Work detail `/works/[slug]`
- Artwork/project title and metadata.
- Large images in natural proportion.
- Long vertical flow.
- Optional project text.
- Previous / next work at bottom.
- Optional quiet full-screen viewer.

## Exhibitions `/exhibitions`
- Chronological, CV-like.
- Separate solo and group exhibitions if useful.
- Use year as a strong organizational element.
- Installation views may be linked when available.

## About `/about`
- Short bio.
- Artist statement where appropriate.
- Portrait only if desired.
- Downloadable CV PDF.
- Contact details.
- Gallery/representation only if current and accurate.

## Contact `/contact`
Keep simple:
- email
- Instagram
- representation if applicable
- no unnecessary contact form unless needed

## Texts `/texts` — optional
For:
- artist statements
- essays
- press
- interviews

Use serif long-form styling and a comfortable reading measure.

---

# 16. Tone of voice

Writing should be:
- concise
- calm
- factual
- personal where appropriate
- intelligent without sounding academic for its own sake
- similar to a museum label, artist catalogue, or exhibition text

Avoid:
- sales language
- hype
- exaggerated adjectives
- “discover”
- “explore”
- “journey”
- “unique vision”
- “unlock”
- “immersive experience” unless literally accurate

Artwork descriptions should prioritize:
- title
- year
- material
- dimensions
- context
- process, when meaningful

Never invent biography, exhibitions, galleries, awards, artwork titles, dates, materials, dimensions, or credits.

Use placeholders clearly marked when real information is unavailable.

---

# 17. Accessibility

Required:
- semantic HTML
- keyboard-accessible navigation
- visible focus styles
- descriptive alt text
- no essential information conveyed by color alone
- sufficient text/background contrast
- reduced-motion support
- logical heading hierarchy
- usable touch targets on mobile
- labels for form inputs
- no autoplay audio/video

Focus suggestion:

```css
:focus-visible {
  outline: 2px solid var(--color-turquoise);
  outline-offset: 4px;
}
```

Artwork alt text should not merely say “image” or repeat the filename.

---

# 18. Responsive behavior

Design mobile deliberately; do not merely shrink desktop.

## Desktop
- editorial asymmetry
- large margins
- image/text interplay
- generous negative space

## Mobile
- primarily one-column reading flow
- artwork full-width within page margin
- simpler image sequencing
- maintain metadata hierarchy
- reduce `space-3xl` and `space-2xl`, but retain visual breathing room
- large titles must not overflow
- no horizontal scrolling

Suggested responsive spacing:

```css
@media (max-width: 700px) {
  :root {
    --space-xl: 48px;
    --space-2xl: 72px;
    --space-3xl: 104px;
  }
}
```

---

# 19. Content structure

Prefer editable content separate from presentation code.

Suggested structure:

```text
content/
  works/
    project-slug/
      index.mdx
      images/
        01.jpg
        02.jpg
  exhibitions.yaml
  texts/
  site.yaml

public/
  brand/
  cv/
```

Example artwork frontmatter:

```yaml
title: "Untitled (Field)"
year: 2026
medium: "Oil and mixed media on linen"
dimensions: "180 × 140 cm"
series: "Field Studies"
featured: true
order: 3
images:
  - src: "./images/01.jpg"
    alt: "Full view of Untitled (Field)"
    caption: ""
    credit: ""
```

Requirements:
- Missing required content should fail clearly during development/build where practical.
- Do not silently invent missing data.
- Image alt text must not be empty for meaningful images.

---

# 20. Technical implementation rules

Current project direction:
- Next.js
- App Router
- TypeScript
- CSS Modules / design tokens
- No UI kit unless explicitly approved
- No Tailwind unless explicitly approved later

Code principles:
- Keep components small and purposeful.
- Avoid creating a component abstraction for every trivial element.
- Use design tokens instead of random hard-coded values.
- Reuse typography and spacing tokens.
- Keep content data separate from layout.
- Keep dependencies minimal.
- Optimize images.
- Avoid client-side JavaScript when a server component or CSS solution is sufficient.
- Test desktop and mobile.
- Run typecheck/lint/build before pushing.

---

# 21. Design tokens — consolidated

```css
:root {
  /* Color */
  --color-bordeaux: #6A2E3B;
  --color-pink: #D79A9A;
  --color-turquoise: #5FAEAD;
  --color-off-white: #F6F1EC;
  --color-ink: #1C1718;

  /* Font */
  --font-sans: Arial, Helvetica, sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;

  /* Type */
  --type-display-xl: 88px;
  --type-heading-lg: 48px;
  --type-heading-md: 28px;
  --type-body-lg: 28px;
  --type-body: 17px;
  --type-nav: 14px;
  --type-caption: 13px;

  /* Spacing */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 40px;
  --space-xl: 64px;
  --space-2xl: 104px;
  --space-3xl: 168px;

  /* Radius */
  --radius-none: 0px;
  --radius-sm: 4px;

  /* Lines / elevation */
  --border-hairline: 1px solid rgba(28, 23, 24, 0.22);
  --shadow-overlay: 0 2px 12px rgba(28, 23, 24, 0.06);
}
```

---

# 22. Claude Code working rules

Before changing the UI:

1. Read this complete file.
2. Inspect the relevant existing components and styles.
3. Reuse the defined design tokens.
4. Preserve existing correct content and functionality.
5. Do not invent colors, typography, biographical details, artworks, exhibitions, galleries, dates, or contact information.
6. Do not introduce a new visual system for a single page.
7. Explain any deliberate deviation from this codebook before implementing it.
8. When asked for a new page, propose its content hierarchy first if the brief is ambiguous.
9. Test responsive behavior.
10. Run lint/typecheck/build where available before commit/push.
11. Never push a major redesign to `main` without showing or describing the result first unless explicitly instructed.
12. For small approved content changes, use the existing structure rather than redesigning unrelated areas.

---

# 23. Final design test

Before considering a page complete, ask:

- Does the artwork dominate the interface?
- Is there enough empty space?
- Does this feel like an exhibition catalogue rather than a software product?
- Are the brand colors restrained and intentional?
- Are artworks uncropped and unfiltered?
- Is type hierarchy based on size and spacing rather than excessive bold?
- Is long-form text comfortably narrow?
- Are interactive elements quiet and clear?
- Is the page usable by keyboard?
- Does mobile still feel designed rather than merely compressed?
- Did we avoid invented artist information?
- Did we avoid unnecessary cards, rounded corners, shadows, gradients, and animations?

If the answer to any is no, revise before finalizing.
