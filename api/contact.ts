import { clientKey, rateLimited, sendContactMessage } from '../server/src/mailer.js';

// Production counterpart to the Express route in server/src/index.ts. Both do
// nothing but read the request and hand it to the shared mailer, so the two
// surfaces cannot disagree about validation or wording.

type Request = {
  method?: string;
  body?: unknown;
  headers: Record<string, unknown>;
  socket?: { remoteAddress?: string };
};

type Response = {
  status: (code: number) => { json: (body: unknown) => void };
};

// Vercel parses a JSON body for us, but only when the content type says so;
// a form-encoded or absent type arrives as a raw string.
function parseBody(body: unknown): Record<string, unknown> {
  if (typeof body !== 'string') return (body as Record<string, unknown>) ?? {};
  try {
    const parsed: unknown = JSON.parse(body);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export default async function handler(request: Request, response: Response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const key = clientKey(request.headers ?? {}, request.socket?.remoteAddress ?? 'unknown');
  if (rateLimited(key)) {
    response.status(429).json({ error: 'Too many messages from this connection. Please try again later.' });
    return;
  }

  const outcome = await sendContactMessage(parseBody(request.body));
  if (outcome.ok) {
    response.status(200).json({ ok: true });
    return;
  }
  response.status(outcome.status).json({ error: outcome.error });
}
