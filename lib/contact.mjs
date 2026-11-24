import {INQUIRY_TYPES, SUPPORT_EMAIL} from './site.mjs';

export const CONTACT_LIMITS = {name: 100, email: 254, subject: 150, message: 4000};
export const MAILTO_SAFE_LENGTH = 1800;

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function clean(value) {
  return String(value ?? '').replace(/\r\n/g, '\n').trim();
}

export function validateContact(input) {
  const values = {
    name: clean(input?.name),
    email: clean(input?.email),
    inquiry: clean(input?.inquiry),
    subject: clean(input?.subject).replace(/[\r\n]+/g, ' '),
    message: clean(input?.message),
  };
  const errors = {};
  if (!values.name) errors.name = 'Enter your full name.';
  else if (values.name.length > CONTACT_LIMITS.name) errors.name = `Name must be ${CONTACT_LIMITS.name} characters or fewer.`;
  if (!values.email) errors.email = 'Enter your email address.';
  else if (values.email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(values.email)) errors.email = 'Enter a valid email address with a name, @ sign and domain.';
  if (!values.inquiry) errors.inquiry = 'Choose an inquiry type.';
  else if (!INQUIRY_TYPES.includes(values.inquiry)) errors.inquiry = 'Choose one of the listed inquiry types.';
  if (!values.subject) errors.subject = 'Enter a subject.';
  else if (values.subject.length > CONTACT_LIMITS.subject) errors.subject = `Subject must be ${CONTACT_LIMITS.subject} characters or fewer.`;
  if (!values.message) errors.message = 'Enter a message.';
  else if (values.message.length > CONTACT_LIMITS.message) errors.message = `Message must be ${CONTACT_LIMITS.message} characters or fewer.`;
  return {ok: Object.keys(errors).length === 0, errors, values};
}

export function contactSubject(values) {
  return `[${values.inquiry}] ${values.subject}`;
}

export function contactBody(values) {
  return [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    `Inquiry type: ${values.inquiry}`,
    `Subject: ${values.subject}`,
    '',
    'Message:',
    values.message,
  ].join('\n');
}

export function contactDraft(values, recipient = SUPPORT_EMAIL) {
  return `To: ${recipient}\nSubject: ${contactSubject(values)}\n\n${contactBody(values)}`;
}

export function mailtoUrl(values, recipient = SUPPORT_EMAIL) {
  const query = new URLSearchParams({subject: contactSubject(values), body: contactBody(values)});
  return `mailto:${recipient}?${query.toString().replace(/\+/g, '%20')}`;
}

export function gmailComposeUrl(values, recipient = SUPPORT_EMAIL) {
  const query = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: recipient,
    su: contactSubject(values),
    body: contactBody(values),
  });
  return `https://mail.google.com/mail/?${query.toString()}`;
}

export function directMailto(recipient = SUPPORT_EMAIL) {
  return `mailto:${recipient}`;
}

export function mailtoMayTruncate(url) {
  return String(url).length > MAILTO_SAFE_LENGTH;
}
