import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {coreRoutes, toolRegistry, isIndexableTool} from '../lib/catalog.mjs';
import {canonicalUrl, sitemapEntries, pageMetadata} from '../lib/seo.mjs';
import robots from '../app/robots.js';

test('sitemap has exactly 36 unique normalized production URLs and no fabricated metadata', () => {
  const entries = sitemapEntries();
  assert.equal(entries.length, 36);
  assert.equal(new Set(entries.map(entry => entry.url)).size, 36);
  assert.equal(toolRegistry.filter(isIndexableTool).length, 30);
  assert.equal(coreRoutes.length, 6);
  for (const entry of entries) {
    assert.deepEqual(Object.keys(entry), ['url']);
    assert.equal(entry.url, canonicalUrl(new URL(entry.url).pathname));
  }
});

test('future published tools are automatic; every non-public or noindex state is excluded', () => {
  const future = {slug: 'future-tool', published: true};
  assert.ok(sitemapEntries([...toolRegistry, future]).some(entry => entry.url.endsWith('/future-tool/')));
  for (const flags of [{published: false}, {published: undefined}, {enabled: false}, {disabled: true}, {placeholder: true}, {status: 'draft'}, {status: 'unpublished'}, {status: 'disabled'}, {status: 'placeholder'}, {indexable: false}, {noindex: true}, {robots: {index: false}}]) {
    assert.equal(isIndexableTool({...future, ...flags}), false, JSON.stringify(flags));
    assert.equal(sitemapEntries([...toolRegistry, {...future, ...flags}]).length, 36);
  }
});

test('duplicates and malformed registry routes fail instead of silently entering the sitemap', () => {
  assert.throws(() => sitemapEntries([...toolRegistry, toolRegistry[0]]), /Duplicate/);
  assert.throws(() => sitemapEntries([{slug: 'tools', published: true}]), /Duplicate/);
  for (const path of ['//tools/', '/tools', '/Tools/', '/tools/?q=1', '/tools/#a', '/a/../b/', 'https://preview.vercel.app/', '/a b/', '/a%20b/']) {
    assert.throws(() => canonicalUrl(path), /Invalid/);
  }
});

test('all pages use self-referencing shared metadata without changing editorial titles', () => {
  for (const {url} of sitemapEntries()) {
    const path = new URL(url).pathname;
    const source = readFileSync(new URL(`../app${path}page.jsx`, import.meta.url), 'utf8');
    assert.ok(source.includes(`pageMetadata('${path}',`), path);
    const result = pageMetadata(path, {title: 'Unique title', description: 'Unique description', openGraph: {url: 'https://wrong.test/'}});
    assert.equal(result.alternates.canonical, url);
    assert.equal(result.openGraph.url, url);
    assert.equal(result.title, 'Unique title');
    assert.equal(result.description, 'Unique description');
    assert.deepEqual(result.robots, {index: true, follow: true});
  }
  assert.equal(pageMetadata('/unknown/', {}).robots.index, false);
  assert.equal(pageMetadata('/', {robots: {index: false}}).robots.index, false);
});

test('registry exclusion also sets page noindex and robots allows rendering assets', () => {
  toolRegistry.push({slug: 'draft-test', published: false});
  try {
    assert.equal(pageMetadata('/draft-test/', {}).robots.index, false);
    assert.ok(!sitemapEntries().some(entry => entry.url.endsWith('/draft-test/')));
  } finally { toolRegistry.pop(); }
  assert.deepEqual(robots(), {rules: {userAgent: '*', allow: '/'}, sitemap: 'https://threemelo.com/sitemap.xml'});
});
