/** Official ThreeMelo mailbox. Used when NEXT_PUBLIC_SUPPORT_EMAIL is unset or invalid. */
export const DEFAULT_SUPPORT_EMAIL = 'everydaytools.pro@gmail.com';

export const SITE_NAME = 'ThreeMelo';
export const SITE_URL = 'https://threemelo.com';

export const INQUIRY_TYPES = [
  'General Inquiry',
  'Technical Support',
  'Report a Bug',
  'Suggest a Tool',
  'Feature Request',
  'Business Inquiry',
  'Privacy and Legal',
];

const SAFE_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** Accept a configured mailbox, otherwise use the official fallback. */
export function resolveSupportEmail(raw) {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (value && value.length <= 254 && SAFE_EMAIL.test(value)) return value;
  return DEFAULT_SUPPORT_EMAIL;
}

export const SUPPORT_EMAIL = resolveSupportEmail(process.env.NEXT_PUBLIC_SUPPORT_EMAIL);
