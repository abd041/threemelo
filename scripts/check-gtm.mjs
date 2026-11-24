import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else if (name.endsWith('.html') || name.endsWith('.xml')) acc.push(path);
  }
  return acc;
}

const html = walk('out').filter(file => file.endsWith('.html'));
const bad = [];
for (const file of html) {
  const text = readFileSync(file, 'utf8');
  const js = (text.match(/googletagmanager\.com\/gtm\.js/g) || []).length;
  const ns = (text.match(/googletagmanager\.com\/ns\.html/g) || []).length;
  const id = (text.match(/GTM-WDSPZP27/g) || []).length;
  if (js !== 1 || ns !== 1) bad.push({file, js, ns, id});
}
const home = readFileSync('out/index.html', 'utf8');
const css = readFileSync('out/3d-css-transform-generator/index.html', 'utf8');
const sitemap = readFileSync('out/sitemap.xml', 'utf8');
const idx = css.indexOf('GTM-WDSPZP27');
const positions = [];
let from = 0;
while (true) {
  const at = home.indexOf('ns.html', from);
  if (at < 0) break;
  positions.push(home.slice(Math.max(0, at - 60), at + 80).replaceAll('\n', ' '));
  from = at + 1;
}
const consentAt = home.indexOf('analytics_storage');
console.log(JSON.stringify({
  html: html.length,
  pagesWithTwoRealNoscripts: bad.filter(item => item.ns > 1 && false).length,
  homeAsync: home.includes('j.async=true'),
  homeDenied: home.includes('"analytics_storage":"denied"'),
  homeAds: home.includes('"ad_storage":"denied"'),
  homeGuard: home.includes('__threemeloGtm'),
  homeDataLayer: home.includes('window.dataLayer=window.dataLayer||[]'),
  homeNoscript: home.includes('ns.html?id=GTM-WDSPZP27'),
  sitemap: (sitemap.match(/<loc>/g) || []).length,
  cssIdCount: (css.match(/GTM-WDSPZP27/g) || []).length,
  cssContext: css.slice(Math.max(0, idx - 80), idx + 120),
  noscriptContexts: positions,
  consentContext: consentAt < 0 ? null : home.slice(consentAt - 40, consentAt + 80),
  waitForUpdate: (home.match(/wait_for_update/g) || []).length,
  redaction: (home.match(/ads_data_redaction/g) || []).length,
  scriptSnippets: home.split('<script').slice(1).map(part => part.slice(0, 240)).filter(part => /dataLayer|gtm\.js|__threemeloGtm|wait_for_update/.test(part)),
  consentScript: (home.match(/id="threemelo-consent"/g) || []).length,
  gtmScript: (home.match(/id="threemelo-gtm"/g) || []).length,
  gtmUrls: (home.match(/googletagmanager\.com\\?\/gtm\.js/g) || []).length,
  gtmIds: (home.match(/threemelo-gtm/g) || []).length,
  consentIds: (home.match(/threemelo-consent/g) || []).length,
  nextS: (home.match(/__next_s/g) || []).length,
  loaderContexts: [...home.matchAll(/__threemeloGtm/g)].map(match => home.slice(match.index, match.index + 280)),
  loaderCount: (home.match(/__threemeloGtm/g) || []).length,
  iframeTags: (home.match(/<iframe /g) || []).length,
  noscriptTags: (home.match(/<noscript>/g) || []).length,
}, null, 2));
