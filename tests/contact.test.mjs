import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {DEFAULT_SUPPORT_EMAIL, INQUIRY_TYPES, SUPPORT_EMAIL, resolveSupportEmail} from '../lib/site.mjs';
import {CONTACT_LIMITS, contactBody, contactDraft, contactSubject, directMailto, gmailComposeUrl, mailtoMayTruncate, mailtoUrl, validateContact} from '../lib/contact.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const official = 'everydaytools.pro@gmail.com';
const sample = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  inquiry: 'Report a Bug',
  subject: 'Viewer & "export"',
  message: 'Line one\nLine two? 100% + more',
};

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === 'out' || name === '.git') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else if (/\.(jsx|js|mjs|md|css|json|txt|example)$/.test(name) || name === '.env.example') acc.push(path);
  }
  return acc;
}

test('official support email is the default and the invalid-config fallback', () => {
  assert.equal(DEFAULT_SUPPORT_EMAIL, official);
  assert.equal(SUPPORT_EMAIL, resolveSupportEmail(process.env.NEXT_PUBLIC_SUPPORT_EMAIL));
  if (!process.env.NEXT_PUBLIC_SUPPORT_EMAIL) assert.equal(SUPPORT_EMAIL, official);
  for (const value of [undefined, '', '   ', 'not-an-email', 'bad yosef.c@example.com', 'a@b', 'javascript:alert(1)']) assert.equal(resolveSupportEmail(value), official);
  assert.equal(resolveSupportEmail('  Team@Example.com  '), 'Team@Example.com');
});

test('inquiry types match the public contact form', () => {
  assert.deepEqual(INQUIRY_TYPES, ['General Inquiry', 'Technical Support', 'Report a Bug', 'Suggest a Tool', 'Feature Request', 'Business Inquiry', 'Privacy and Legal']);
});

test('contact validation requires every field and rejects bad values', () => {
  const empty = validateContact({});
  assert.equal(empty.ok, false);
  for (const key of ['name', 'email', 'inquiry', 'subject', 'message']) assert.ok(empty.errors[key]);
  assert.equal(validateContact({...sample, name: '   '}).ok, false);
  assert.match(validateContact({...sample, email: 'ada@invalid'}).errors.email, /valid email/i);
  assert.match(validateContact({...sample, inquiry: 'Partnership'}).errors.inquiry, /listed/i);
  assert.equal(validateContact({...sample, name: 'A'.repeat(CONTACT_LIMITS.name + 1)}).ok, false);
  assert.equal(validateContact({...sample, subject: 'S'.repeat(CONTACT_LIMITS.subject + 1)}).ok, false);
  assert.equal(validateContact({...sample, message: 'M'.repeat(CONTACT_LIMITS.message + 1)}).ok, false);
  const valid = validateContact(sample);
  assert.equal(valid.ok, true);
  assert.deepEqual(valid.errors, {});
  assert.equal(valid.values.inquiry, 'Report a Bug');
});

test('mailto and Gmail links encode the recipient, subject and message', () => {
  const values = validateContact(sample).values;
  assert.equal(contactSubject(values), '[Report a Bug] Viewer & "export"');
  assert.match(contactBody(values), /Name: Ada Lovelace/);
  assert.match(contactBody(values), /Email: ada@example.com/);
  assert.match(contactBody(values), /Inquiry type: Report a Bug/);
  assert.match(contactBody(values), /Line one\nLine two\? 100% \+ more/);
  assert.match(contactDraft(values), new RegExp(`^To: ${official}`));
  assert.doesNotMatch(contactDraft(values), /has been sent|successfully sent/i);

  const mailto = new URL(mailtoUrl(values));
  assert.equal(mailto.protocol, 'mailto:');
  assert.equal(mailto.pathname, official);
  assert.equal(mailto.searchParams.get('subject'), contactSubject(values));
  assert.equal(mailto.searchParams.get('body'), contactBody(values));
  assert.doesNotMatch(mailtoUrl(values), /\s/);
  assert.equal(directMailto(), `mailto:${official}`);

  const gmail = new URL(gmailComposeUrl(values));
  assert.equal(gmail.origin, 'https://mail.google.com');
  assert.equal(gmail.pathname, '/mail/');
  assert.equal(gmail.searchParams.get('view'), 'cm');
  assert.equal(gmail.searchParams.get('fs'), '1');
  assert.equal(gmail.searchParams.get('to'), official);
  assert.equal(gmail.searchParams.get('su'), contactSubject(values));
  assert.equal(gmail.searchParams.get('body'), contactBody(values));
  assert.equal(mailtoMayTruncate('x'.repeat(1801)), true);
  assert.equal(mailtoMayTruncate(mailtoUrl(values)), false);
});

test('contact page is indexable and does not pretend to send mail', () => {
  const page = readFileSync(new URL('../app/contact/page.jsx', import.meta.url), 'utf8');
  const form = readFileSync(new URL('../components/ContactForm.jsx', import.meta.url), 'utf8');
  const layout = readFileSync(new URL('../app/layout.jsx', import.meta.url), 'utf8');
  assert.match(page, /canonical:\s*'\/contact\/'/);
  assert.match(page, /index:\s*true/);
  assert.match(page, /ContactPage/);
  assert.match(page, /Open Email Draft|ContactForm/);
  assert.doesNotMatch(page + form, /noindex|not configured|email has been sent|message has been sent successfully/i);
  assert.match(form, /Open Email Draft/);
  assert.match(form, /Open in Gmail/);
  assert.match(form, /Copy email address/);
  assert.match(form, /Copy complete message/);
  assert.match(form, /has not been sent/);
  assert.match(layout, /Organization/);
  assert.match(layout, /mailto:\$\{SUPPORT_EMAIL\}/);
  assert.doesNotMatch(readFileSync(new URL('../app/sitemap.js', import.meta.url), 'utf8'), /NEXT_PUBLIC_SUPPORT_EMAIL/);
});

test('no external email service, backend route or stray mailbox is used', () => {
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
  assert.doesNotMatch(pkg, /resend|emailjs|sendgrid|formspree|nodemailer/i);
  assert.equal(statExists(join(root, 'app', 'api')), false);
  const email = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  for (const file of walk(root)) {
    if (file.endsWith(`${join('tests', 'contact.test.mjs')}`)) continue;
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, /resend|emailjs|sendgrid|formspree|nodemailer|\bsmtp\b/i, file);
    for (const found of text.match(email) || []) assert.equal(found, official, file);
  }
});

function statExists(path) {
  try { return statSync(path).isDirectory() || statSync(path).isFile(); } catch { return false; }
}
