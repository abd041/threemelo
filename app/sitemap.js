import {sitemapEntries} from '../lib/seo.mjs';

export const dynamic = 'force-static';
export default function sitemap() {
  return sitemapEntries();
}
