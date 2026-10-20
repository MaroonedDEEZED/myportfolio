import { useState, type ChangeEvent as ReactChangeEvent, type FormEvent as ReactFormEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { CV } from '../types';

type SendState = 'idle' | 'sending' | 'sent' | 'error';

const EMPTY_FORM = { name: '', email: '', phone: '', message: '', company: '' };

// Posts to /api/contact, which sends through EmailJS: the visitor receives the
// branded confirmation (email-templates/visitor-confirmation.html) and the studio
// inbox is copied on it, with Reply-To set so answering reaches the visitor.
//
// Validation proper lives on the server (server/src/mailer.ts) and is what the
// visitor actually sees, so the two can never disagree. The `required` and
// `type="email"` attributes below only exist for instant native feedback.
function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [state, setState] = useState<SendState>('idle');
  const [notice, setNotice] = useState<string | null>(null);

  const update = (field: keyof typeof EMPTY_FORM) => (event: ReactChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: ReactFormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    setNotice(null);
    void fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        if (!response.ok) throw new Error(payload?.error ?? 'The message could not be sent. Please try again, or write to me directly.');
        setForm(EMPTY_FORM);
        setState('sent');
        setNotice('Thanks, your message is on its way. I usually reply within a day.');
      })
      .catch((error: unknown) => {
        setState('error');
        setNotice(error instanceof Error ? error.message : 'Something went wrong. Please try again, or write to me directly.');
      });
  };

  return (
    <form className="contact-form" onSubmit={submit} aria-describedby={notice ? 'contact-notice' : undefined}>
      <div className="field-pair">
        <label className="field">
          <span className="field-label">Your name</span>
          <input type="text" name="name" value={form.name} onChange={update('name')} required maxLength={120} autoComplete="name" />
        </label>
        <label className="field">
          <span className="field-label">Email</span>
          <input type="email" name="email" value={form.email} onChange={update('email')} required maxLength={200} autoComplete="email" />
        </label>
      </div>
      <label className="field">
        <span className="field-label">Phone <em>optional</em></span>
        <input type="tel" name="phone" value={form.phone} onChange={update('phone')} maxLength={60} autoComplete="tel" />
      </label>
      <label className="field">
        <span className="field-label">Tell me about the project</span>
        <textarea name="message" value={form.message} onChange={update('message')} required rows={6} maxLength={5000} placeholder="What are you making, when do you need it, and where?" />
      </label>

      {/* Honeypot: hidden from people and from assistive tech alike. A submission
          that fills it is dropped silently, so a bot cannot tell it was caught. */}
      <label className="field-honeypot" aria-hidden="true">
        <span>Company</span>
        <input type="text" name="company" value={form.company} onChange={update('company')} tabIndex={-1} autoComplete="off" />
      </label>

      <div className="contact-actions">
        <button className="key key--signal key--large" type="submit" disabled={state === 'sending'} aria-busy={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Send message'} <ArrowUpRight size={17} aria-hidden="true" />
        </button>
        {notice && (
          <p className={state === 'error' ? 'form-note is-error' : 'form-note is-sent'} role="status" id="contact-notice">
            {state === 'error' && <span className="form-note-mark" aria-hidden="true">!</span>}
            {notice}
          </p>
        )}
      </div>
    </form>
  );
}

export function Contact({ cv }: { cv: CV }) {
  return (
    <section className="contact section" id="contact" aria-labelledby="contact-title">
      <div className="contact-copy">
        <h2 id="contact-title">Have a story in mind?</h2>
        <p className="section-lede">Tell me what you are making. A few lines is plenty, and every message comes straight to my inbox.</p>
        <dl className="direct">
          <div><dt>Email</dt><dd><a href={`mailto:${cv.email}`}>{cv.email}</a></dd></div>
          <div><dt>Phone</dt><dd><a href={`tel:${cv.phone.replace(/\s+/g, '')}`} className="data">{cv.phone}</a></dd></div>
          <div><dt>Based in</dt><dd>{cv.location}, available across the GCC</dd></div>
        </dl>
      </div>
      <div className="console-panel">
        <ContactForm />
      </div>
    </section>
  );
}
