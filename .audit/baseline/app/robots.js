import {PRODUCTION_ORIGIN} from '../lib/seo.mjs';

export const dynamic = 'force-static';
export default function robots() {
  return {rules: {userAgent: '*', allow: '/'}, sitemap: `${PRODUCTION_ORIGIN}/sitemap.xml`};
}
