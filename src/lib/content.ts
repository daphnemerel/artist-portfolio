import "server-only";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load as loadYaml } from "js-yaml";
import { imageSize } from "image-size";
import { marked } from "marked";
import { z } from "zod";
import type { Locale } from "@/i18n/config";

const CONTENT_DIR = path.join(process.cwd(), "content");

/*
 * Languages: the content files are written in English. A text that differs per language is
 * written as { nl: "…", en: "…" } in YAML; works and texts can have a Dutch companion file
 * (index.nl.md / name.nl.md) that overrides their written content. Artwork titles stay as they are.
 */

/** A text in one language for both, or a separate text per language. */
const localized = z.union([z.string(), z.object({ nl: z.string(), en: z.string() })]);

/** The type after picking one language: every { nl, en } becomes a plain string. */
type Resolved<T> = T extends { nl: string; en: string }
  ? string
  : T extends Date
    ? T
    : T extends (infer U)[]
      ? Resolved<U>[]
      : T extends object
        ? { [K in keyof T]: Resolved<T[K]> }
        : T;

function pick<T>(value: T, locale: Locale): Resolved<T> {
  if (Array.isArray(value)) return value.map((v) => pick(v, locale)) as Resolved<T>;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const keys = Object.keys(value);
    if (keys.length === 2 && "nl" in value && "en" in value) {
      return (value as Record<Locale, unknown>)[locale] as Resolved<T>;
    }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, pick(v, locale)])) as Resolved<T>;
  }
  return value as Resolved<T>;
}

/* ---------- schemas ---------- */

const siteSchema = z.object({
  name: z.string().min(1),
  description: localized,
  location: z.string().optional(),
  email: z.union([z.email(), z.literal("")]),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  pinterest: z.string().optional(),
  facebook: z.string().optional(),
  youtube: z.string().optional(),
  linkedin: z.string().optional(),
  representation: z
    .array(z.object({ name: z.string(), city: z.string(), url: z.url().optional() }))
    .default([]),
  cv: z.string().optional(),
  bio: localized,
  /** Short introduction on the homepage. */
  intro: localized.optional(),
  /** A current exhibition highlighted on the homepage, with one of the works in it. */
  highlight: z
    .object({
      eyebrow: localized,
      title: localized,
      text: localized,
      work: z.string().min(1), // folder name in content/works
      link: z.object({ label: localized, href: z.string().min(1) }),
      /** The venue beside it: name, details, address, opening hours, website and a map. */
      venue: z
        .object({
          name: z.string().min(1),
          lines: z.array(localized).default([]),
          address: z.array(z.string()).min(1),
          hours: z.array(localized).default([]),
          website: z.url().optional(),
          /** Search text for the map and the "View location" link. */
          map: z.string().min(1),
        })
        .optional(),
    })
    .optional(),
});

const imageEntrySchema = z.object({
  src: z.string().startsWith("./images/", "Image src must be relative, e.g. ./images/01.jpg"),
  alt: z.string().min(1, "Every image needs alt text"),
  caption: z.string().optional(),
  credit: z.string().optional(),
  /** false: kept for other uses (e.g. an experiment), but not shown in the work's slideshow. */
  slideshow: z.boolean().default(true),
});

/**
 * A panel in a work's opening "layers" strip. Either one of the work's images (optionally zoomed
 * in on a point), or a separate picture in images/ that needs its own alt text.
 */
const layerSchema = z.object({
  src: z.string().startsWith("./images/"),
  alt: z.string().optional(),
  zoom: z.number().min(1).default(1),
  focus: z.string().default("50% 50%"),
  /** On phones: the large image beside the title, one of the small ones next to it, or hidden. */
  phone: z.enum(["main", "side"]).optional(),
});

/** "Inside the work": an editorial section of numbered images below the layers strip. */
const journeySchema = z.object({
  eyebrow: z.string().default("The journey"),
  title: z.string(),
  intro: z.string().optional(),
  items: z
    .array(
      z.object({
        src: z.string().startsWith("./images/"),
        alt: z.string().min(1, "Every image needs alt text"),
        label: z.string(),
        text: z.string().optional(),
        focus: z.string().default("50% 50%"),
      }),
    )
    .min(1),
});

const workSchema = z.object({
  title: z.string().min(1),
  year: z.number().int().optional(),
  medium: z.string().min(1),
  dimensions: z.string().optional(),
  edition: z.string().optional(),
  series: z.string().optional(),
  featured: z.boolean().default(false),
  /** painting (default) or drawing: drawings get their own group on the Works page. */
  category: z.enum(["painting", "drawing"]).default("painting"),
  /** Position in the sequence of works (1 = oldest). Higher numbers are shown first. */
  number: z.number().int().positive().optional(),
  order: z.number().default(0),
  draft: z.boolean().default(false),
  images: z.array(imageEntrySchema).min(1, "A work needs at least one image"),
  layers: z.array(layerSchema).optional(),
  journey: journeySchema.optional(),
  /** One-sentence description used beside the work and its price. */
  summary: z.string().optional(),
  /** Price as shown, e.g. "€1.200". Leave out while the work is not for sale. */
  price: z.string().optional(),
  /** e.g. "Available" / "Sold". Shown as "to be added" while empty. */
  availability: z.string().optional(),
  /** false: the enquiry button is replaced by a quiet "not available" label. */
  available: z.boolean().default(true),
  /** The three short texts on the work page (Markdown). Shown as "to be added" while empty. */
  story: z.string().optional(),
  details: z.string().optional(),
  process: z.string().optional(),
});

const exhibitionSchema = z.object({
  /** "upcoming": under Komende exposities; "past": under Eerdere exposities. */
  status: z.enum(["upcoming", "past"]),
  year: z.number().int().optional(),
  /** Shown under the year, e.g. "sept – okt" or "Binnenkort". */
  period: localized.optional(),
  title: localized,
  venue: localized,
  city: localized,
  type: z.enum(["solo", "group", "fair", "screening"]).optional(),
  /** One or two sentences about the exhibition. */
  text: localized.optional(),
  /** Work folder names; the first one gives the small image and the "more information" link. */
  works: z.array(z.string()).default([]),
  /** Used for the link when there is no work, e.g. the venue's page about the exhibition. */
  url: z.url().optional(),
});

const textSchema = z.object({
  title: z.string().min(1),
  kind: z.enum(["statement", "essay", "press", "interview"]),
  author: z.string().optional(),
  publication: z.string().optional(),
  year: z.number().int().optional(),
  order: z.number().default(0),
});

const experimentSchema = z.object({
  title: localized,
  href: z.string().startsWith("/", "Experiment href must be a path on the site, e.g. /catching-waves-preview"),
  date: z.coerce.date().optional(),
  summary: localized.optional(),
});

/** index.nl.md next to a work's index.md: Dutch versions of its written content (all optional). */
const workTranslationSchema = z.object({
  medium: z.string().optional(),
  dimensions: z.string().optional(),
  edition: z.string().optional(),
  series: z.string().optional(),
  summary: z.string().optional(),
  price: z.string().optional(),
  availability: z.string().optional(),
  story: z.string().optional(),
  details: z.string().optional(),
  process: z.string().optional(),
  /** By position, matching `images` in index.md. */
  images: z.array(z.object({ alt: z.string().optional(), caption: z.string().optional(), credit: z.string().optional() })).optional(),
  layers: z.array(z.object({ alt: z.string().optional() })).optional(),
  journey: z
    .object({
      eyebrow: z.string().optional(),
      title: z.string().optional(),
      intro: z.string().optional(),
      items: z.array(z.object({ alt: z.string().optional(), label: z.string().optional(), text: z.string().optional() })).optional(),
    })
    .optional(),
});

/* ---------- types ---------- */

export type Site = Resolved<z.infer<typeof siteSchema>>;
export type Exhibition = Resolved<z.infer<typeof exhibitionSchema>>;
export type Experiment = Resolved<z.infer<typeof experimentSchema>> & { number: string };

export type WorkImage = z.infer<typeof imageEntrySchema> & {
  url: string;
  width: number;
  height: number;
};

export type WorkLayer = {
  image: Pick<WorkImage, "url" | "alt" | "width" | "height">;
  zoom: number;
  focus: string;
  phone?: "main" | "side";
};

export type JourneyItem = Omit<z.infer<typeof journeySchema>["items"][number], "src"> & {
  url: string;
  width: number;
  height: number;
};

export type WorkJourney = Omit<z.infer<typeof journeySchema>, "items"> & { items: JourneyItem[] };

export type Work = Omit<z.infer<typeof workSchema>, "images" | "layers" | "journey"> & {
  slug: string;
  images: WorkImage[];
  layers?: WorkLayer[];
  journey?: WorkJourney;
  html: string;
};

export type WorkSummary = Omit<Work, "html">;

export type Text = z.infer<typeof textSchema> & { slug: string; html: string };

/* ---------- helpers ---------- */

function parse<T>(schema: z.ZodType<T>, data: unknown, source: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid content in ${source}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

function readYaml(file: string): unknown {
  return loadYaml(readFileSync(path.join(CONTENT_DIR, file), "utf8"));
}

function renderMarkdown(body: string): string {
  return marked.parse(body.trim(), { async: false });
}

/* ---------- site ---------- */

let siteCache: z.infer<typeof siteSchema> | undefined;

export function getSite(locale: Locale): Site {
  siteCache ??= parse(siteSchema, readYaml("site.yaml"), "content/site.yaml");
  return pick(siteCache, locale);
}

/* ---------- works ---------- */

const worksCache: Partial<Record<Locale, Work[]>> = {};

/** Reads index.md, then (for Dutch) lays index.nl.md over it where present. */
function readWorkSource(dir: string, slug: string, locale: Locale) {
  const source = `content/works/${slug}/index.md`;
  const { data, content } = matter(readFileSync(path.join(dir, "index.md"), "utf8"));
  const meta = parse(workSchema, data, source);
  const translationFile = path.join(dir, `index.${locale}.md`);
  if (locale === "en" || !existsSync(translationFile)) return { meta, content, source };

  const translated = matter(readFileSync(translationFile, "utf8"));
  const tr = parse(workTranslationSchema, translated.data, `content/works/${slug}/index.${locale}.md`);
  const merged: typeof meta = {
    ...meta,
    ...(tr.medium && { medium: tr.medium }),
    ...(tr.dimensions && { dimensions: tr.dimensions }),
    ...(tr.edition && { edition: tr.edition }),
    ...(tr.series && { series: tr.series }),
    ...(tr.summary && { summary: tr.summary }),
    ...(tr.price && { price: tr.price }),
    ...(tr.availability && { availability: tr.availability }),
    ...(tr.story && { story: tr.story }),
    ...(tr.details && { details: tr.details }),
    ...(tr.process && { process: tr.process }),
    images: meta.images.map((image, i) => ({ ...image, ...defined(tr.images?.[i]) })),
    layers: meta.layers?.map((layer, i) => ({ ...layer, ...defined(tr.layers?.[i]) })),
    journey: meta.journey && {
      ...meta.journey,
      ...defined({ eyebrow: tr.journey?.eyebrow, title: tr.journey?.title, intro: tr.journey?.intro }),
      items: meta.journey.items.map((item, i) => ({ ...item, ...defined(tr.journey?.items?.[i]) })),
    },
  };
  return { meta: merged, content: translated.content.trim() ? translated.content : content, source };
}

/** Drops undefined keys, so they don't overwrite the English value. */
function defined<T extends object>(value: T | undefined): Partial<T> {
  return Object.fromEntries(Object.entries(value ?? {}).filter(([, v]) => v !== undefined)) as Partial<T>;
}

function loadWork(slug: string, locale: Locale): Work {
  const dir = path.join(CONTENT_DIR, "works", slug);
  const { meta, content, source } = readWorkSource(dir, slug, locale);

  const resolve = (src: string) => {
    const file = path.join(dir, src);
    if (!existsSync(file)) throw new Error(`Missing image ${src} referenced in ${source}`);
    const { width, height } = imageSize(readFileSync(file));
    if (!width || !height) throw new Error(`Could not read dimensions of ${src} in ${source}`);
    return { url: `/media/works/${slug}/${src.replace("./images/", "")}`, width, height };
  };

  const images = meta.images.map((image) => ({ ...image, ...resolve(image.src) }));

  const layers = meta.layers?.map(({ src, alt, ...rest }) => {
    const listed = images.find((i) => i.src === src);
    if (!listed && !alt) throw new Error(`Layer ${src} in ${source} needs alt text`);
    const image = listed ? { ...listed, alt: alt ?? listed.alt } : { ...resolve(src), alt: alt! };
    return { image, ...rest };
  });

  const journey = meta.journey && {
    ...meta.journey,
    items: meta.journey.items.map(({ src, ...item }) => ({ ...item, ...resolve(src) })),
  };

  return { ...meta, slug, images, layers, journey, html: renderMarkdown(content) };
}

/** All published works, newest first, then by `order`. */
export function getWorks(locale: Locale): Work[] {
  worksCache[locale] ??= readdirSync(path.join(CONTENT_DIR, "works"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => loadWork(entry.name, locale))
    .filter((work) => !work.draft)
    .sort(
      (a, b) =>
        // numbered works first, newest (highest number) first; then the rest by year and order
        (b.number ?? -Infinity) - (a.number ?? -Infinity) || byYearDesc(a, b) || a.order - b.order,
    );
  return worksCache[locale];
}

export function getWork(slug: string, locale: Locale): Work | undefined {
  return getWorks(locale).find((work) => work.slug === slug);
}

export function getFeaturedWorks(locale: Locale): Work[] {
  return getWorks(locale).filter((work) => work.featured);
}

/* ---------- exhibitions ---------- */

export function getExhibitions(locale: Locale): Exhibition[] {
  const data = readYaml("exhibitions.yaml");
  return pick(parse(z.array(exhibitionSchema), data, "content/exhibitions.yaml"), locale).sort(byYearDesc);
}

/* ---------- experiments ---------- */

/** Experiments in the order of content/experiments.yaml, numbered 01, 02, … */
export function getExperiments(locale: Locale): Experiment[] {
  const data = readYaml("experiments.yaml") ?? [];
  return pick(parse(z.array(experimentSchema), data, "content/experiments.yaml"), locale).map((e, i) => ({
    ...e,
    number: String(i + 1).padStart(2, "0"),
  }));
}

/* ---------- texts ---------- */

const textsCache: Partial<Record<Locale, Text[]>> = {};

/** Texts in content/texts/*.md; for Dutch, name.nl.md (title and body) replaces name.md where present. */
export function getTexts(locale: Locale): Text[] {
  const dir = path.join(CONTENT_DIR, "texts");
  textsCache[locale] ??= readdirSync(dir)
    .filter((file) => file.endsWith(".md") && !/\.(nl|en)\.md$/.test(file))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const { data, content } = matter(readFileSync(path.join(dir, file), "utf8"));
      const meta = parse(textSchema, data, `content/texts/${file}`);
      const translated = path.join(dir, `${slug}.${locale}.md`);
      if (locale !== "en" && existsSync(translated)) {
        const tr = matter(readFileSync(translated, "utf8"));
        const trMeta = parse(textSchema.partial(), tr.data, `content/texts/${slug}.${locale}.md`);
        return { ...meta, ...defined(trMeta), slug, html: renderMarkdown(tr.content.trim() ? tr.content : content) };
      }
      return { ...meta, slug, html: renderMarkdown(content) };
    })
    .sort((a, b) => a.order - b.order || byYearDesc(a, b));
  return textsCache[locale];
}

export function getText(slug: string, locale: Locale): Text | undefined {
  return getTexts(locale).find((text) => text.slug === slug);
}

/* ---------- years ---------- */

/** Newest first; items without a year go last. */
function byYearDesc(a: { year?: number }, b: { year?: number }): number {
  return (b.year ?? -Infinity) - (a.year ?? -Infinity) || 0;
}

/** Groups by year, newest first; items without a year are grouped last under `undefined`. */
export function groupByYear<T extends { year?: number }>(items: T[]): [number | undefined, T[]][] {
  const groups = new Map<number | undefined, T[]>();
  for (const item of items) {
    groups.set(item.year, [...(groups.get(item.year) ?? []), item]);
  }
  return [...groups.entries()].sort(([a], [b]) => byYearDesc({ year: a }, { year: b }));
}
