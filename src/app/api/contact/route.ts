import nodemailer from "nodemailer";
import { getSite } from "@/lib/content";

/*
 * Contact form → Daphne's Gmail. Runs on the server (Vercel function), so the Gmail app password
 * stays in the GMAIL_APP_PASSWORD environment variable and never reaches the browser.
 * The mail is sent from and to the site's own address, with the visitor as Reply-To.
 */

const LIMITS = { name: 120, email: 200, subject: 200, message: 5000 };
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

type Fields = {
  name: string;
  email: string;
  subject: string;
  message: string;
  botcheck?: unknown;
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
