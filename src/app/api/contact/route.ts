import nodemailer from "nodemailer";
import { getSite } from "@/lib/content";

/*
 * Contact form → Daphne's Gmail. Runs on the server (Vercel function), so the Gmail app password
 * stays in the GMAIL_APP_PASSWORD environment variable and never reaches the browser.
 * The mail is sent from and to the site's own address, with the visitor as Reply-To.
 */

const LIMITS = { name: 120, email: 200, subject: 200, message: 5000 };

/*
 * Spam protection, free and without outside services (on top of the hidden "botcheck" box):
 * - the form must have been open for a few seconds (bots post instantly);
 * - at most a few messages per visitor (IP address) per hour, and a ceiling for the whole site;
 * - only posts from this website itself are accepted;
 * - messages stuffed with links are dropped.
 * The counters live in the server's memory, so they are a best effort (a new server instance
 * starts fresh); for a small portfolio site that is enough to stop floods and keep Gmail safe.
 */
const MIN_SECONDS = 3;
const PER_VISITOR = { max: 5, windowMs: 60 * 60 * 1000 };
const SITE_WIDE = { max: 40, windowMs: 60 * 60 * 1000 };
const MAX_LINKS = 5;

const hits = new Map<string, number[]>();
function tooMany(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // never let the memory grow without bound
  return false;
}

/** The post must come from a page of this site (blocks other websites posting to the form). */
function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // some browsers leave it out on same-origin requests
  try {
    return (
      new URL(origin).host === new URL(request.url).host ||
      new URL(origin).host === request.headers.get("x-forwarded-host")
    );
  } catch {
    return false;
  }
}
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

type Fields = {
  name: string;
  email: string;
  subject: string;
  message: string;
  botcheck?: unknown;
  /** Milliseconds the form was open before sending. */
  elapsed?: unknown;
};

export async function POST(request: Request) {
  const site = getSite("en"); // name and email are the same in every language
  const user = process.env.GMAIL_USER || site.email;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) {
    return Response.json(
      { ok: false, error: "not-configured" },
      { status: 503 },
    );
  }

  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (tooMany(`ip:${ip}`, PER_VISITOR) || tooMany("site", SITE_WIDE)) {
    return Response.json({ ok: false, error: "rate-limited" }, { status: 429 });
  }

  let body: Partial<Fields>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Spam trap: real visitors never tick the hidden box. Pretend it worked.
  if (body.botcheck) return Response.json({ ok: true });

  const clean = (v: unknown, max: number) =>
    String(v ?? "")
      .trim()
      .slice(0, max);
  const name = clean(body.name, LIMITS.name).replace(/[\r\n]+/g, " ");
  const email = clean(body.email, LIMITS.email);
  const subject = clean(body.subject, LIMITS.subject).replace(/[\r\n]+/g, " ");
  const message = clean(body.message, LIMITS.message);
  if (!name || !message || !isEmail(email)) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  // Sent too quickly, or full of links: almost certainly spam. Pretend it worked.
  const elapsed = Number(body.elapsed);
  const links = (message.match(/https?:\/\/|www\./gi) ?? []).length;
  if (!(elapsed >= MIN_SECONDS * 1000) || links > MAX_LINKS) {
    return Response.json({ ok: true });
  }

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  try {
    await transport.sendMail({
      from: { name: `${site.name} website`, address: user },
      to: user,
      replyTo: { name, address: email },
      subject: subject
        ? `Website: ${subject}`
        : `Website: message from ${name}`,
      text: `${message}\n\n—\n${name}\n${email}`,
    });
  } catch (error) {
    console.error("Contact form: sending failed", error);
    const code =
      (error as { code?: string; responseCode?: number })?.responseCode ??
      (error as { code?: string })?.code;
    return Response.json(
      { ok: false, error: `send-failed${code ? `-${code}` : ""}` },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
