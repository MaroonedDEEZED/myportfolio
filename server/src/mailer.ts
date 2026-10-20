// Contact-form delivery.

// Both the Express server (local dev) and the Vercel function in api/ import
// this module, so the validation and the wording of a message can only drift in
// one place. Nothing here is imported by the client — the browser bundle must
// never pull in the EmailJS private key.

export type ContactInput = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  /** Honeypot. A real visitor never sees this field, so any value means a bot. */
  company?: unknown;
};

export type ContactOutcome =
  | { ok: true }
  | { ok: false; status: number; error: string };

/** The request once every field is known to be a usable, trimmed string. */
export type ContactFields = { name: string; email: string; phone: string; message: string };

const NAME_MAX = 120;
const EMAIL_MAX = 200;
const PHONE_MAX = 60;
const MESSAGE_MIN = 5;
const MESSAGE_MAX = 5000;

// Deliberately permissive: shaped like an address, not a spec-complete check.
// Anything stricter starts rejecting addresses that really do work.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

/** Collapses newlines so a crafted name cannot forge extra header lines. */
const singleLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';
// EmailJS refuses requests that carry no Origin header (anti-abuse), and plain
// server-side fetch sends none. Any honest origin works.
const EMAILJS_ORIGIN = 'http://localhost';
const EMAILJS_TIMEOUT_MS = 10000;

function readConfig() {
  const serviceId = process.env.EMAILJS_SERVICE_ID?.trim();
  const templateId = process.env.EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = process.env.EMAILJS_PUBLIC_KEY?.trim();
  const privateKey = process.env.EMAILJS_PRIVATE_KEY?.trim();
  if (!serviceId || !templateId || !publicKey || !privateKey) return null;
  return { serviceId, templateId, publicKey, privateKey };
}

/** True when the deployment has enough configuration to actually send. */
export function mailConfigured() {
  return readConfig() !== null;
}

// Best-effort throttle. A serverless deployment runs several ephemeral instances,
// so this bounds a single instance rather than the whole site; it is a speed bump
// for a naive flood, not a real quota. The honeypot below is the primary trap.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

export function rateLimited(key: string) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(key, hits);
    return true;
  }
  hits.push(now);
  recent.set(key, hits);
  // Keep the map from growing without bound on a long-lived process.
  if (recent.size > 500) {
    for (const [entry, times] of recent) {
      if (!times.some((at) => now - at < WINDOW_MS)) recent.delete(entry);
    }
  }
  return false;
}

export function validateContact(input: ContactInput): { ok: true; value: ContactFields } | { ok: false; error: string } {
  const name = singleLine(asText(input.name));
  const email = singleLine(asText(input.email));
  const phone = singleLine(asText(input.phone));
  const message = asText(input.message);

  if (!name) return { ok: false, error: 'Please add your name.' };
  if (name.length > NAME_MAX) return { ok: false, error: 'That name is too long.' };
  if (!email) return { ok: false, error: 'Please add an email address.' };
  if (email.length > EMAIL_MAX || !EMAIL_SHAPE.test(email)) return { ok: false, error: 'That email address does not look right.' };
  if (phone.length > PHONE_MAX) return { ok: false, error: 'That phone number is too long.' };
  if (message.length < MESSAGE_MIN) return { ok: false, error: 'Please write a few words about the project.' };
  if (message.length > MESSAGE_MAX) return { ok: false, error: 'That message is too long — please keep it under 5000 characters.' };

  return { ok: true, value: { name, email, phone, message } };
}

/** Contact line shown at the foot of the visitor's copy — email, plus phone when given. */
function composeContact(value: ContactFields) {
  return value.phone ? `${value.email} · ${value.phone}` : value.email;
}

// Map EmailJS's failure statuses onto what the visitor should see. The details
// are logged server-side; the visitor only ever gets a plain retry message.
function emailjsFailure(status: number): { status: number; error: string } {
  if (status === 429) {
    return { status: 429, error: 'Too many messages from this connection. Please try again later.' };
  }
  return { status: 502, error: 'The message could not be sent just now. Please try again shortly.' };
}

/**
 * Validates and sends. Returns `{ok:true}` for anything a visitor should see as
 * success — including a honeypot hit, which is dropped silently so a bot cannot
 * learn that it was caught.
 *
 * The private key rides in `accessToken`, which is exactly why this stays on the
 * server: the browser only ever talks to /api/contact.
 */
export async function sendContactMessage(input: ContactInput): Promise<ContactOutcome> {
  if (asText(input.company)) return { ok: true };

  const checked = validateContact(input);
  if (!checked.ok) return { ok: false, status: 400, error: checked.error };

  const config = readConfig();
  if (!config) {
    console.error('[contact] EMAILJS_* variables are not set; cannot send.');
    return { ok: false, status: 503, error: 'Email is not configured on this server yet.' };
  }

  const value = checked.value;

  try {
    const response = await fetch(EMAILJS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Sent by browsers automatically; EmailJS blocks requests without it.
        Origin: EMAILJS_ORIGIN,
      },
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.templateId,
        user_id: config.publicKey,
        accessToken: config.privateKey,
        template_params: {
          // These names must match the {{variables}} in the EmailJS template.
          name: value.name,
          // The template's "To Email" is {{email}} — the visitor's own address.
          email: value.email,
          contact: composeContact(value),
          message: value.message,
        },
      }),
      signal: AbortSignal.timeout(EMAILJS_TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error(`[contact] EmailJS send failed (${response.status}): ${detail}`);
      return { ok: false, ...emailjsFailure(response.status) };
    }

    return { ok: true };
  } catch (error) {
    console.error('[contact] send failed:', error instanceof Error ? error.message : error);
    return { ok: false, status: 502, error: 'The message could not be sent just now. Please try again shortly.' };
  }
}

/** Client IP, best effort — used only to key the throttle. */
export function clientKey(headers: Record<string, unknown>, fallback: string) {
  const forwarded = headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const first = typeof raw === 'string' ? raw.split(',')[0].trim() : '';
  return first || fallback;
}
