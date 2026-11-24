"""Audit a real Next.js export over local HTTP. Python standard library only.

Run after npm run build: python scripts/audit-seo.py
This validates the export, not production DNS, CDN rules, or search-engine indexing.
"""
import functools
import json
import re
import subprocess
import threading
import xml.etree.ElementTree as ET
from collections import Counter
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import unquote, urljoin, urlsplit
from urllib.request import build_opener, HTTPRedirectHandler, Request

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'out'
ORIGIN = 'https://threemelo.com'
NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.canonical, self.og, self.robots, self.descriptions = [], [], [], []
        self.links, self.assets, self.ids, self.schemas = [], [], set(), []
        self.title, self.h1, self.content = '', '', ''
        self.in_title = self.in_h1 = self.in_main = False
        self.in_script = self.in_style = self.in_schema = False
        self.schema = ''
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.add(a['id'])
        if tag == 'title': self.in_title = True
        if tag == 'h1': self.in_h1 = True
        if tag == 'main': self.in_main = True
        if tag == 'style': self.in_style = True
        if tag == 'script':
            self.in_script = True
            self.in_schema = a.get('type') == 'application/ld+json'
            self.schema = ''
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a.get('href'))
        if tag == 'meta':
            name = (a.get('name') or '').lower()
            if name in ('robots', 'googlebot', 'bingbot'): self.robots.append(a.get('content', '').lower())
            if name == 'description': self.descriptions.append(a.get('content', ''))
            if a.get('property') == 'og:url': self.og.append(a.get('content'))
        if tag in ('script', 'img', 'source') and a.get('src'): self.assets.append(a['src'])
        if tag == 'link' and a.get('rel') in ('stylesheet', 'icon', 'apple-touch-icon', 'preload', 'modulepreload') and a.get('href'):
            self.assets.append(a['href'])

    def handle_data(self, text):
        if self.in_title: self.title += text
        if self.in_h1: self.h1 += text
        if self.in_main and not self.in_script and not self.in_style: self.content += text
        if self.in_schema: self.schema += text

    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag == 'h1': self.in_h1 = False
        if tag == 'main': self.in_main = False
        if tag == 'style': self.in_style = False
        if tag == 'script':
            if self.in_schema: self.schemas.append(json.loads(self.schema))
            self.in_script = self.in_schema = False


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_): pass


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *_): return None


def audit():
    registry = json.loads(subprocess.check_output([
        'node', '--input-type=module', '-e',
        "import {coreRoutes,toolRoutes} from './lib/catalog.mjs';console.log(JSON.stringify({coreRoutes,toolRoutes}));"
    ], cwd=ROOT, text=True))
    expected = [ORIGIN + route for route in registry['coreRoutes'] + registry['toolRoutes']]
    errors, pages, rows, assets, broken, canonical_mismatches, noindex = [], {}, [], set(), [], [], []

    def check(condition, message):
        if not condition: errors.append(message)

    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(OUT)))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    local = f'http://127.0.0.1:{server.server_port}'
    opener = build_opener(NoRedirect())

    def fetch(path, method='GET'):
        try:
            with opener.open(Request(local + path, method=method), timeout=15) as response:
                return response.status, response.read().decode('utf-8') if method == 'GET' else '', response.headers
        except HTTPError as error:
            return error.code, '', error.headers

    try:
        status, xml, headers = fetch('/sitemap.xml')
        check(status == 200, f'Sitemap HTTP {status}')
        check('xml' in headers.get('Content-Type', ''), 'Sitemap is not served as XML')
        root = ET.fromstring(xml)  # Reject malformed XML, not merely matching URL text.
        check(root.tag == NS + 'urlset', 'Wrong sitemap namespace/root')
        urls = []
        for item in root:
            check(item.tag == NS + 'url', 'Invalid sitemap child')
            locations = item.findall(NS + 'loc')
            check(len(locations) == 1, 'Missing or duplicate loc')
            urls.append(locations[0].text)
            check([child.tag for child in item] == [NS + 'loc'], 'Unexpected or unverified sitemap metadata')
        duplicates = len(urls) - len(set(urls))
        check(len(urls) == 36 and duplicates == 0, 'Expected 36 unique URLs')
        check(set(urls) == set(expected), 'Sitemap differs from registry/core routes')

        status, robots, _ = fetch('/robots.txt')
        expected_robots = [('user-agent', '*'), ('allow', '/'), ('sitemap', 'https://threemelo.com/sitemap.xml')]
        # Directive names are case-insensitive; Next.js emits "User-Agent".
        actual_robots = [(key.strip().lower(), value.strip()) for key, value in
                         (line.split(':', 1) for line in robots.splitlines() if line.strip() and ':' in line)]
        robots_valid = status == 200 and actual_robots == expected_robots
        check(robots_valid, 'Unexpected robots.txt rules or sitemap reference')

        for url in urls:
            parsed = urlsplit(url)
            check(parsed.scheme == 'https' and parsed.netloc == 'threemelo.com' and not parsed.query and not parsed.fragment, f'Invalid production URL: {url}')
            path = parsed.path
            check(bool(re.fullmatch(r'/(?:[a-z0-9]+(?:-[a-z0-9]+)*/)*', path)), f'Noncanonical route: {url}')
            check((OUT / path.strip('/') / 'index.html').is_file(), f'Missing export: {url}')
            status, html, headers = fetch(path)
            if status != 200: broken.append(url)
            check(status == 200, f'Page HTTP {status}: {url}')
            page = Page(html)
            pages[url] = page
            if page.canonical != [url]: canonical_mismatches.append(url)
            check(page.canonical == [url], f'Canonical mismatch/duplicate: {url}: {page.canonical}')
            check(page.og == [url], f'Open Graph URL mismatch/missing: {url}: {page.og}')
            directives = ','.join(page.robots + [headers.get('X-Robots-Tag', '').lower()])
            if re.search(r'\b(noindex|none)\b', directives): noindex.append(url)
            check(not re.search(r'\b(noindex|nofollow|none)\b', directives), f'Blocking robots directive: {url}')
            check(bool(page.title.strip()), f'Missing title: {url}')
            check(len(page.descriptions) == 1 and bool(page.descriptions[0].strip()), f'Missing/duplicate description: {url}')
            check(bool(page.h1.strip()) and len(page.content.strip()) > 100, f'Empty page/possible soft 404: {url}')
            check('This page could not be found' not in page.content, f'Soft 404: {url}')
            check(html.count('threemelo-gtm') == 1 and 'GTM-WDSPZP27' in html, f'GTM changed/duplicated: {url}')
            rows.append({'url': url, 'http_status': status, 'canonical': page.canonical, 'open_graph_url': page.og, 'robots': page.robots, 'title': page.title, 'description': page.descriptions, 'main_text_characters': len(page.content.strip())})

        for label, values in [('title', [p.title for p in pages.values()]), ('description', [p.descriptions[0] if p.descriptions else '' for p in pages.values()])]:
            check(len(set(values)) == len(urls), f'Duplicate {label}: {[v for v, count in Counter(values).items() if count > 1]}')

        graph = {url: set() for url in urls}
        for url, page in pages.items():
            destinations = list(page.links)
            for schema in page.schemas:
                if schema.get('@type') == 'BreadcrumbList':
                    destinations.extend(item['item'] for item in schema.get('itemListElement', []) if isinstance(item.get('item'), str))
            for href in destinations:
                target = urlsplit(urljoin(url, href))
                if target.scheme not in ('http', 'https'): continue
                if target.netloc not in ('threemelo.com', 'www.threemelo.com'): continue
                path = target.path or '/'
                destination = ORIGIN + path
                if destination in pages:
                    check(target.scheme == 'https' and target.netloc == 'threemelo.com' and not target.query, f'Noncanonical internal link: {url} -> {href}')
                    graph[url].add(destination)
                    if target.fragment: check(unquote(target.fragment) in pages[destination].ids, f'Broken fragment: {url} -> {href}')
                else:
                    status, _, _ = fetch(path, 'HEAD')
                    if status != 200: broken.append(f'{url} -> {href}')
                    check(status == 200, f'Broken/redirecting internal link ({status}): {url} -> {href}')
                    check('.' in Path(path).name, f'Page link missing from sitemap: {url} -> {href}')
            for src in page.assets:
                asset = urlsplit(urljoin(url, src))
                if asset.netloc == 'threemelo.com': assets.add(asset.path)

        for asset in sorted(assets):
            status, _, _ = fetch(asset, 'HEAD')
            check(status == 200, f'Broken rendering asset ({status}): {asset}')

        reached, pending = set(), [ORIGIN + '/']
        while pending:
            url = pending.pop()
            if url in reached: continue
            reached.add(url)
            pending.extend(graph[url] - reached)
        orphans = sorted(set(urls) - reached)
        check(not orphans, f'Orphan pages: {orphans}')
        for entry in ['/', '/tools/']:
            check(all(ORIGIN + route in graph[ORIGIN + entry] for route in registry['toolRoutes']), f'Tools not directly discoverable from {entry}')
        check(fetch('/this-route-does-not-exist/', 'HEAD')[0] == 404, 'Unknown route is a soft 404 on local server')

        report = {
            'scope': 'Production export served over local HTTP; live hosting not verified',
            'sitemap_urls': len(urls), 'published_tools': len(registry['toolRoutes']), 'core_pages': len(registry['coreRoutes']),
            'duplicate_urls': duplicates, 'broken_urls': len(broken), 'canonical_mismatches': len(canonical_mismatches),
            'orphan_pages': len(orphans), 'noindex_pages': len(noindex), 'robots_valid': robots_valid,
            'xml_valid': True, 'xml_namespace': NS[1:-1], 'rendering_assets_checked': len(assets),
            'errors': errors, 'pages': rows,
        }
        (ROOT / 'seo-audit-results.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
        print(json.dumps({key: value for key, value in report.items() if key != 'pages'}, indent=2))
        if errors: raise SystemExit(1)
    finally:
        server.shutdown()
        server.server_close()
        thread.join()


if __name__ == '__main__':
    audit()
