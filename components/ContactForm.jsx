'use client';
import {useId, useState} from 'react';
import {INQUIRY_TYPES, SUPPORT_EMAIL} from '../lib/site.mjs';
import {track} from '../lib/analytics.mjs';
import {contactDraft, directMailto, gmailComposeUrl, mailtoMayTruncate, mailtoUrl, validateContact} from '../lib/contact.mjs';

const FIELDS = ['name', 'email', 'inquiry', 'subject', 'message'];
const EMPTY = {name: '', email: '', inquiry: '', subject: '', message: ''};

async function writeClipboard(text) {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function openLink(url, blank) {
  const link = document.createElement('a');
  link.href = url;
  link.dataset.analyticsTracked = 'true';
  if (blank) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function ContactForm() {
  const baseId = useId();
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState('');
  const result = validateContact(form);
  const preview = result.ok ? contactDraft(result.values) : '';
  const visibleErrors = {};
  for (const key of FIELDS) {
    if ((attempted || touched[key]) && result.errors[key]) visibleErrors[key] = result.errors[key];
  }

  function change(key, value) {
    setForm(current => ({...current, [key]: value}));
    setStatus('');
  }

  function showInvalid() {
    setAttempted(true);
    const first = FIELDS.find(key => result.errors[key]);
    document.getElementById(`${baseId}-${first}`)?.focus();
  }

  function prepare(kind) {
    if (!result.ok) {
      showInvalid();
      setStatus('Complete the highlighted fields before preparing an email. Nothing has been sent.');
      return null;
    }
    setAttempted(true);
    return kind === 'gmail' ? gmailComposeUrl(result.values) : mailtoUrl(result.values);
  }

  function onSubmit(event) {
    event.preventDefault();
    const url = prepare('mailto');
    if (!url) return;
    track('contact_email_open', {action: 'mailto'});
    openLink(url, false);
    const caution = mailtoMayTruncate(url)
      ? ' This draft is long, so some email apps may shorten it. If the message looks incomplete, use Copy complete message or Open in Gmail.'
      : '';
    setStatus(`A draft addressed to ${SUPPORT_EMAIL} was opened in your default email application, if one is configured. The message has not been sent. Review it there and choose Send.${caution} If no email app opened, copy the address and the complete message, then paste them into webmail.`);
  }

  function onGmail() {
    const url = prepare('gmail');
    if (!url) return;
    track('contact_email_open', {action: 'gmail'});
    openLink(url, true);
    setStatus(`A Gmail compose tab was requested for ${SUPPORT_EMAIL}. The message has not been sent. If the tab did not appear, allow pop-ups or copy the complete message and paste it into Gmail. Review the draft and choose Send there. ThreeMelo does not send email for you.`);
  }

  async function onCopyEmail() {
    const copied = await writeClipboard(SUPPORT_EMAIL);
    setStatus(copied
      ? `Copied ${SUPPORT_EMAIL}. Paste it into your email app. Nothing has been sent.`
      : `Clipboard is unavailable. Select ${SUPPORT_EMAIL} below and copy it manually. Nothing has been sent.`);
  }

  async function onCopyMessage() {
    if (!result.ok) {
      showInvalid();
      setStatus('Complete the highlighted fields before copying the message. Nothing has been sent.');
      return;
    }
    const copied = await writeClipboard(contactDraft(result.values));
    setStatus(copied
      ? `Copied the complete message to ${SUPPORT_EMAIL}. Paste it into your email app and send it yourself. Nothing has been sent.`
      : 'Clipboard is unavailable. Select the prepared message below and copy it manually. Nothing has been sent.');
  }

  function fieldProps(key) {
    const errorId = `${baseId}-${key}-error`;
    const hintId = `${baseId}-${key}-hint`;
    return {
      id: `${baseId}-${key}`,
      'aria-invalid': visibleErrors[key] ? 'true' : 'false',
      'aria-describedby': visibleErrors[key] ? `${hintId} ${errorId}` : hintId,
      onBlur: () => setTouched(current => ({...current, [key]: true})),
    };
  }

  return (
    <form className="tm-contact-form" onSubmit={onSubmit} noValidate aria-labelledby={`${baseId}-title`}>
      <div className="tm-contact-form-head">
        <span className="eyebrow">PREPARE A MESSAGE</span>
        <h2 id={`${baseId}-title`}>Write to ThreeMelo</h2>
        <p>This form stays in your browser. It opens a draft to <a href={directMailto()}>{SUPPORT_EMAIL}</a>. You send that draft from your email application.</p>
      </div>

      {attempted && !result.ok && <p className="tm-field-error" role="alert">Check the highlighted fields. Every field is required before a draft can be prepared. Nothing has been sent.</p>}

      <div className="tm-fields">
        <div className="tm-field">
          <label htmlFor={`${baseId}-name`}>Full name</label>
          <input {...fieldProps('name')} name="name" type="text" autoComplete="name" maxLength={100} required value={form.name} onChange={event => change('name', event.target.value)} />
          <small id={`${baseId}-name-hint`}>The name that should appear in the email.</small>
          {visibleErrors.name && <p id={`${baseId}-name-error`} className="tm-field-error">{visibleErrors.name}</p>}
        </div>
        <div className="tm-field">
          <label htmlFor={`${baseId}-email`}>Email address</label>
          <input {...fieldProps('email')} name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} required spellCheck="false" value={form.email} onChange={event => change('email', event.target.value)} />
          <small id={`${baseId}-email-hint`}>So a reply can reach you. It is placed only in the draft.</small>
          {visibleErrors.email && <p id={`${baseId}-email-error`} className="tm-field-error">{visibleErrors.email}</p>}
        </div>
        <div className="tm-field">
          <label htmlFor={`${baseId}-inquiry`}>Inquiry type</label>
          <select {...fieldProps('inquiry')} name="inquiry" required value={form.inquiry} onChange={event => change('inquiry', event.target.value)}>
            <option value="">Select an inquiry type</option>
            {INQUIRY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <small id={`${baseId}-inquiry-hint`}>This is added to the email subject.</small>
          {visibleErrors.inquiry && <p id={`${baseId}-inquiry-error`} className="tm-field-error">{visibleErrors.inquiry}</p>}
        </div>
        <div className="tm-field">
          <label htmlFor={`${baseId}-subject`}>Subject</label>
          <input {...fieldProps('subject')} name="subject" type="text" maxLength={150} required value={form.subject} onChange={event => change('subject', event.target.value)} />
          <small id={`${baseId}-subject-hint`}>A short summary of your question.</small>
          {visibleErrors.subject && <p id={`${baseId}-subject-error`} className="tm-field-error">{visibleErrors.subject}</p>}
        </div>
        <div className="tm-field tm-field-wide">
          <label htmlFor={`${baseId}-message`}>Message</label>
          <textarea {...fieldProps('message')} name="message" rows={7} maxLength={4000} required value={form.message} onChange={event => change('message', event.target.value)} />
          <small id={`${baseId}-message-hint`}>Include the tool name, browser and what happened. Avoid passwords and private files.</small>
          {visibleErrors.message && <p id={`${baseId}-message-error`} className="tm-field-error">{visibleErrors.message}</p>}
        </div>
      </div>

      <div className="tm-contact-actions">
        <button className="button tm-primary" type="submit">Open Email Draft</button>
        <button className="tm-outline" type="button" onClick={onGmail}>Open in Gmail</button>
        <button className="tm-outline" type="button" onClick={onCopyEmail}>Copy email address</button>
        <button className="tm-outline" type="button" onClick={onCopyMessage}>Copy complete message</button>
      </div>

      <div className="tm-contact-status" role="status" aria-live="polite">{status}</div>

      <section className="tm-contact-steps" aria-labelledby={`${baseId}-steps`}>
        <h3 id={`${baseId}-steps`}>How to send this message</h3>
        <ol>
          <li>Complete every field. The form checks them in your browser.</li>
          <li>Choose <strong>Open Email Draft</strong> to open your default email app with the recipient, subject and message filled in. Or choose <strong>Open in Gmail</strong>.</li>
          <li>Review the draft and choose Send in that email app. ThreeMelo cannot send it for you, and this page will not say that it has been sent.</li>
          <li>If no email app is configured, or nothing opens, copy the address and the complete message, then paste them into any mail service.</li>
        </ol>
      </section>

      <section className="tm-contact-preview" aria-labelledby={`${baseId}-preview`}>
        <div className="tm-contact-preview-head">
          <h3 id={`${baseId}-preview`}>Prepared message</h3>
          <a href={directMailto()}>Email {SUPPORT_EMAIL} directly</a>
        </div>
        {preview
          ? <textarea readOnly value={preview} aria-label="Prepared email you still need to send" />
          : <p>The prepared message appears here after the required fields are valid. It is not sent from this website.</p>}
      </section>
    </form>
  );
}
