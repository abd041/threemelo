import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync, readdirSync} from 'node:fs';
import {tools} from '../lib/catalog.mjs';
import {homeCategories} from '../lib/home.mjs';
import {INQUIRY_TYPES} from '../lib/site.mjs';
import {ANALYTICS_EVENTS, CONSENT_BOOTSTRAP, CONSENT_DEFAULT, GTM_ID, applyAnalyticsConsent, track, trackDownload, buildDataLayerEvent, consentUpdate, createPageViewTracker, isConverter, isModelFormat, isSafeToken, pushDataLayerEvent, readConsent, safeFormat, sanitizePagePath, toolSlugFromPath} from '../lib/analytics.mjs';

const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');
const GTM_LOADER = read('../app/layout.jsx').match(/const GTM_LOADER = `([\s\S]*?)`;/)[1].replace('${GTM_ID}', GTM_ID);
const slugs = new Set(tools.map(tool => tool.slug));
const required = ['tool_open', 'tool_interaction', 'file_upload', 'file_download', 'model_export', 'conversion_complete', 'preset_selected', 'tool_search', 'category_selected', 'tool_error', 'contact_email_open'];

test('GTM container is hardcoded once and loads asynchronously', () => {
  assert.equal(GTM_ID, 'GTM-WDSPZP27');
  assert.deepEqual(GTM_LOADER.match(/GTM-[A-Z0-9]+/g), [GTM_ID]);
  assert.equal(GTM_LOADER.match(/googletagmanager\.com\/gtm\.js/g).length, 1);
  assert.match(GTM_LOADER, /j\.async=true/);
  assert.match(GTM_LOADER, /window\.__threemeloGtm/);
  assert.match(GTM_LOADER, /window\.dataLayer=window\.dataLayer\|\|\[\]/);
  const analytics = read('../lib/analytics.mjs');
  const layout = read('../app/layout.jsx');
  assert.doesNotMatch(analytics + layout, /NEXT_PUBLIC_GTM|process\.env\.GTM|process\.env\.NEXT_PUBLIC/);
  assert.match(layout, /beforeInteractive/);
  assert.match(layout, /afterInteractive/);
  assert.match(layout, /NODE_ENV === 'production'/);
  assert.match(layout, /ns\.html\?id=\$\{GTM_ID\}/);
  assert.equal(layout.match(/id="threemelo-gtm"/g).length, 1);
  assert.equal(layout.match(/id="threemelo-consent"/g).length, 1);
});

test('the loader inserts gtm.js once', () => {
  const scripts = [];
  const document = {
    getElementsByTagName: () => [{parentNode: {insertBefore(node) { scripts.push(node); }}}],
    createElement: () => ({async: false, src: ''}),
  };
  const listeners = {};
  const window = {document, addEventListener: (name, callback) => { listeners[name] = callback; }};
  window.window = window;
  vm.runInNewContext(GTM_LOADER, {window, document});
  vm.runInNewContext(GTM_LOADER, {window, document});
  assert.equal(scripts.length, 0);
  window.__threemeloAnalyticsAllowed = true;
  listeners['threemelo-analytics-consent']();
  listeners['threemelo-analytics-consent']();
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].async, true);
  assert.equal(scripts[0].src, 'https://www.googletagmanager.com/gtm.js?id=GTM-WDSPZP27');
});

test('Consent Mode defaults to denied and never grants advertising', () => {
  for (const key of ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage', 'functionality_storage', 'personalization_storage']) {
    assert.equal(CONSENT_DEFAULT[key], 'denied');
  }
  assert.equal(CONSENT_DEFAULT.security_storage, 'granted');
  const source = read('../lib/analytics.mjs');
  assert.equal(source.match(/ad_storage:'granted'|"ad_storage":"granted"/g), null);
  assert.equal(source.match(/ad_user_data:'granted'|"ad_user_data":"granted"/g), null);
  assert.equal(source.match(/ad_personalization:'granted'|"ad_personalization":"granted"/g), null);
  const update = consentUpdate(true);
  assert.equal(update.analytics_storage, 'granted');
  assert.equal(update.ad_storage, 'denied');
  assert.equal(update.ad_user_data, 'denied');
  assert.equal(update.ad_personalization, 'denied');
  assert.equal(consentUpdate(false).analytics_storage, 'denied');

  function boot(saved) {
    const localStorage = {getItem: () => saved};
    const window = {};
    window.window = window;
    vm.runInNewContext(CONSENT_BOOTSTRAP, {window, localStorage});
    return window.dataLayer.map(entry => [...entry]);
  }
  const denied = boot(null);
  assert.equal(denied[0][0], 'consent');
  assert.equal(denied[0][1], 'default');
  assert.equal(denied[0][2].analytics_storage, 'denied');
  assert.equal(denied[0][2].ad_storage, 'denied');
  assert.equal(denied[1][2], true);
  assert.equal(denied[2][2], false);
  assert.equal(denied.some(entry => entry[1] === 'update'), false);
  const allowed = boot(JSON.stringify({analytics: true}));
  const consentUpdateCall = allowed.find(entry => entry[1] === 'update');
  assert.equal(consentUpdateCall[2].analytics_storage, 'granted');
  assert.equal(consentUpdateCall[2].ad_storage, 'denied');
  assert.equal(consentUpdateCall[2].ad_personalization, 'denied');
});

test('page views include the first consented load and ignore query text', () => {
  const tracker = createPageViewTracker();
  assert.deepEqual(tracker('/?q=secret'), {event: 'page_view', page_path: '/'});
  assert.deepEqual(tracker('/tools/?q=stl%20viewer#results'), {event: 'page_view', page_path: '/tools/'});
  assert.equal(tracker('/tools/'), null);
  assert.deepEqual(tracker('/Tools/../secret?draft=hidden'), {event: 'page_view', page_path: '/'});
  assert.equal(sanitizePagePath('/contact/?subject=hello'), '/contact/');
});

test('events keep safe labels and drop personal or file data', () => {
  for (const name of required) assert.ok(ANALYTICS_EVENTS.includes(name));
  assert.equal(tools.length, 30);
  for (const tool of tools) {
    assert.equal(isSafeToken(tool.slug), true, tool.slug);
    assert.equal(toolSlugFromPath(`/${tool.slug}/?file=secret.stl`, slugs), tool.slug);
  }
  for (const category of ['All tools', ...homeCategories]) assert.equal(isSafeToken(category), true, category);
  for (const inquiry of INQUIRY_TYPES) assert.equal(isSafeToken(inquiry), true, inquiry);
  assert.deepEqual(buildDataLayerEvent('tool_search', {query: 'private search', result_count: 3, filename: 'secret.stl'}), {event: 'tool_search', result_count: 3});
  assert.equal(buildDataLayerEvent('tool_search', {result_count: -1}).result_count, undefined);
  assert.equal(buildDataLayerEvent('tool_search', {result_count: 1.5}).result_count, undefined);
  const blocked = 'ada' + String.fromCharCode(64) + 'example.com';
  const contact = buildDataLayerEvent('contact_email_open', {inquiry: blocked, action: 'gmail', email: blocked, message: 'hello', name: 'Ada', subject: 'Viewer'});
  assert.equal(contact.inquiry, undefined);
  assert.equal(contact.email, undefined);
  assert.equal(contact.message, undefined);
  assert.equal(contact.action, 'gmail');
  assert.deepEqual(buildDataLayerEvent('contact_email_open', {inquiry: 'Report a Bug', action: 'mailto'}), {event: 'contact_email_open', action: 'mailto'});
  assert.equal(buildDataLayerEvent('preset_selected', {tool: 'svg-to-stl', value: 'secret-model.stl'}).value, undefined);
  assert.equal(buildDataLayerEvent('file_upload', {tool: 'stl-viewer', format: 'stl', filename: 'face.png'}).filename, undefined);
  assert.equal(buildDataLayerEvent('purchase', {tool: 'stl-viewer'}), null);
  assert.equal(safeFormat('image/jpeg', 'C:\\Users\\Ada\\My Face.jpeg'), 'jpg');
  assert.equal(safeFormat('', 'secret.stl'), 'stl');
  assert.equal(safeFormat('', 'notes.txt'), 'txt');
  assert.equal(safeFormat('model/gltf-binary', 'model.bin'), 'glb');
  assert.equal(isModelFormat('stl'), true);
  assert.equal(isModelFormat('png'), false);
  assert.equal(isConverter('glb-to-stl'), true);
  assert.equal(isConverter('stl-viewer'), false);
  assert.equal(readConsent('{"analytics":true}').analytics, true);
  assert.equal(readConsent('{"analytics":"yes"}'), null);
  assert.equal(readConsent('nope'), null);
});

test('dataLayer pushes only in production after analytics consent', () => {
  const pushed = [];
  const previous = globalThis.window;
  globalThis.window = {dataLayer: {push(value) { pushed.push(value); }}};
  try {
    assert.equal(pushDataLayerEvent('tool_open', {tool: 'stl-viewer'}, {production: false, analyticsAllowed: true}), false);
    assert.equal(pushDataLayerEvent('tool_open', {tool: 'stl-viewer'}, {production: true, analyticsAllowed: false}), false);
    assert.equal(pushed.length, 0);
    assert.equal(pushDataLayerEvent('tool_open', {tool: 'stl-viewer', filename: 'secret.stl'}, {production: true, analyticsAllowed: true}), true);
    assert.deepEqual(pushed, [{event: 'tool_open', tool: 'stl-viewer', page_path: '/', page_location: 'https://threemelo.com/', page_referrer: ''}]);
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});

test('directory, contact and privacy stay free of raw user content', () => {
  const directory = read('../components/ToolDirectory.jsx');
  const form = read('../components/ContactForm.jsx');
  const privacy = read('../app/privacy/page.jsx');
  const pkg = JSON.parse(read('../package.json'));
  assert.match(directory, /track\('tool_search',\{result_count:results\.length\}\)/);
  assert.match(directory, /track\('category_selected',\{category:c\}\)/);
  assert.doesNotMatch(directory, /track\('tool_search',\{[^}]*query/);
  assert.match(form, /track\('contact_email_open', \{action: 'mailto'\}\)/);
  assert.match(form, /track\('contact_email_open', \{action: 'gmail'\}\)/);
  assert.doesNotMatch(form, /track\([^)]*message/);
  assert.match(privacy, /GTM-WDSPZP27/);
  assert.match(privacy, /denied/);
  assert.match(privacy, /Cookie preferences/);
  assert.match(privacy, /filenames/);
  assert.match(privacy, /does not claim that Google Analytics is collecting data/);
  assert.doesNotMatch(privacy, /Google Analytics is collecting data now|GA4 is collecting/i);
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), ['next', 'react', 'react-dom', 'three']);
});


test('arbitrary text, contact fields and unknown paths never enter event payloads', () => {
  const payload = buildDataLayerEvent('tool_interaction', {
    tool: 'Alice Smith', category: 'My private project', value: 'Alice Smith',
    control: 'Private model', inquiry: 'Report a Bug', page_path: '/alice-smith/',
    filename: 'private.stl', query: 'my health', message: 'private'
  });
  assert.deepEqual(payload, {event: 'tool_interaction', page_path: '/'});
});

test('consent changes work without storage, revoke immediately, and downloads omit filenames', () => {
  const previous = globalThis.window;
  const production = process.env.NODE_ENV;
  const events = [];
  globalThis.window = {dataLayer: [], location: {pathname: '/glb-to-stl/?name=private'}, dispatchEvent: event => events.push(event.type)};
  process.env.NODE_ENV = 'production';
  try {
    assert.equal(track('tool_open', {tool: 'glb-to-stl'}), false);
    applyAnalyticsConsent(true);
    trackDownload('Alice private design.stl');
    const payloads = window.dataLayer.filter(entry => entry.event);
    assert.deepEqual(payloads.map(entry => entry.event), ['file_download', 'model_export', 'conversion_complete']);
    assert.ok(payloads.every(entry => entry.page_location === 'https://threemelo.com/glb-to-stl/'));
    assert.ok(payloads.every(entry => entry.page_referrer === ''));
    assert.doesNotMatch(JSON.stringify(payloads), /Alice|private|name=/);
    applyAnalyticsConsent(false);
    const length = window.dataLayer.length;
    trackDownload('secret.stl');
    assert.equal(window.dataLayer.length, length);
    assert.deepEqual(events, ['threemelo-analytics-consent', 'threemelo-analytics-consent']);
  } finally {
    if (previous === undefined) delete globalThis.window; else globalThis.window = previous;
    if (production === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = production;
  }
});

test('noscript is withheld when static HTML cannot verify consent', () => {
  const layout = read('../app/layout.jsx');
  assert.match(layout, /const NOSCRIPT_CONSENT_VERIFIED = false/);
  assert.match(layout, /NOSCRIPT_CONSENT_VERIFIED && <noscript>/);
});


test('every programmatic tool download invokes the reusable tracker exactly once', () => {
  let downloadComponents = 0;
  for (const file of readdirSync(new URL('../components/', import.meta.url)).filter(file => file.endsWith('.jsx'))) {
    const source = read(`../components/${file}`);
    if (!source.includes('a.download')) continue;
    downloadComponents++;
    assert.match(source, /import \{trackDownload\} from '\.\.\/lib\/analytics\.mjs'/, file);
    assert.equal((source.match(/a\.click\(\)/g) || []).length, (source.match(/trackDownload\(a\.download\);a\.click\(\)/g) || []).length, file);
  }
  assert.equal(downloadComponents, 26);
});
