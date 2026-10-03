import "server-only";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load as loadYaml } from "js-yaml";
import { imageSize } from "image-size";
import { marked } from "marked";
import { z } from "zod";

const CONTENT_DIR = path.join(process.cwd(), "content");

/* ---------- schemas ---------- */

const siteSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional(),
  email: z.union([z.email(), z.literal("")]),
  instagram: z.string().optional(),
  representation: z
    .array(z.object({ name: z.string(), city: z.string(), url: z.url().optional() }))
    .default([]),
  cv: z.string().optional(),
  bio: z.string().min(1),
});

const imageEntrySchema = z.object({
  src: z.string().startsWith("./images/", "Image src must be relative, e.g. ./images/01.jpg"),
  alt: z.string().min(1, "Every image needs alt text"),
  caption: z.string().optional(),
  credit: z.string().optional(),
});

const workSchema = z.object({
  title: z.string().min(1),
  year: z.number().int().optional(),
  medium: z.string().min(1),
  dimensions: z.string().optional(),
  edition: z.string().optional(),
  series: z.string().optional(),
  featured: z.boolean().default(false),
  size: z.enum(["large", "medium", "small"]).optional(),
  order: z.number().default(0),
  draft: z.boolean().default(false),
  images: z.array(imageEntrySchema).min(1, "A work needs at least one image"),
});

const exhibitionSchema = z.object({
  year: z.number().int().optional(),
  title: z.string().min(1),
  venue: z.string().min(1),
  city: z.string().min(1),
  type: z.enum(["solo", "group", "fair", "screening"]),
  works: z.array(z.string()).default([]),
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

/* ---------- types ---------- */

export type Site = z.infer<typeof siteSchema>;
export type Exhibition = z.infer<typeof exhibitionSchema>;

export type WorkImage = z.infer<typeof imageEntrySchema> & {
  url: string;
  width: number;
  height: number;
};

export type Work = Omit<z.infer<typeof workSchema>, "images"> & {
  slug: string;
  images: WorkImage[];
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

let siteCache: Site | undefined;

export function getSite(): Site {
  siteCache ??= parse(siteSchema, readYaml("site.yaml"), "content/site.yaml");
  return siteCache;
}

/* ---------- works ---------- */

let worksCache: Work[] | undefined;

function loadWork(slug: string): Work {
  const dir = path.join(CONTENT_DIR, "works", slug);
  const source = `content/works/${slug}/index.md`;
  const { data, content } = matter(readFileSync(path.join(dir, "index.md"), "utf8"));
  const meta = parse(workSchema, data, source);

  const images = meta.images.map((image) => {
    const file = path.join(dir, image.src);
    if (!existsSync(file)) {
      throw new Error(`Missing image ${image.src} referenced in ${source}`);
    }
    const { width, height } = imageSize(readFileSync(file));
    if (!width || !height) throw new Error(`Could not read dimensions of ${image.src} in ${source}`);
    const name = image.src.replace("./images/", "");
    return { ...image, url: `/media/works/${slug}/${name}`, width, height };
  });

  return { ...meta, slug, images, html: renderMarkdown(content) };
}

/** All published works, newest first, then by `order`. */
export function getWorks(): Work[] {
  worksCache ??= readdirSync(path.join(CONTENT_DIR, "works"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => loadWork(entry.name))
    .filter((work) => !work.draft)
    .sort((a, b) => byYearDesc(a, b) || a.order - b.order);
  return worksCache;
}

export function getWork(slug: string): Work | undefined {
  return getWorks().find((work) => work.slug === slug);
}

export function getFeaturedWorks(): Work[] {
  return getWorks().filter((work) => work.featured);
}

/* ---------- exhibitions ---------- */

export function getExhibitions(): Exhibition[] {
  const data = readYaml("exhibitions.yaml");
  return parse(z.array(exhibitionSchema), data, "content/exhibitions.yaml").sort(
    byYearDesc,
  );
}

/* ---------- texts ---------- */

let textsCache: Text[] | undefined;

export function getTexts(): Text[] {
  textsCache ??= readdirSync(path.join(CONTENT_DIR, "texts"))
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const { data, content } = matter(readFileSync(path.join(CONTENT_DIR, "texts", file), "utf8"));
      const meta = parse(textSchema, data, `content/texts/${file}`);
      return { ...meta, slug, html: renderMarkdown(content) };
    })
    .sort((a, b) => a.order - b.order || byYearDesc(a, b));
  return textsCache;
}

export function getText(slug: string): Text | undefined {
  return getTexts().find((text) => text.slug === slug);
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
