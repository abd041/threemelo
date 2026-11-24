# ThreeMelo sitemap and indexability audit

Audit date: 2026-11-24. Production origin: https://threemelo.com.

## Result and scope

The generated static export passes the local production-export SEO audit. All 36 sitemap URLs were requested over an ephemeral localhost HTTP server without redirect following, and their actual HTML was parsed. This is not a claim that the live deployment or Google/Bing indexing is verified. The local server is an audit utility only; it is shut down after the audit and adds no backend to the website.

| Check | Result |
| --- | --- |
| Sitemap URLs | 36 |
| Published tool URLs | 30 |
| Core page URLs | 6 |
| Duplicate sitemap URLs | 0 |
| Broken sitemap/internal URLs | 0 |
| Redirecting sitemap URLs on local export | 0 |
| Canonical mismatches | 0 |
| Open Graph URL mismatches | 0 |
| Orphan pages | 0 |
| Noindex/nofollow pages among the 36 | 0 |
| Unique titles | 36 |
| Unique meta descriptions | 36 |
| XML | Parsed successfully; correct sitemap namespace |
| Robots.txt | HTTP 200; allows all paths; correct sitemap reference |
| Referenced rendering assets | 51; all HTTP 200 |
| Automated Node tests | 253 passed, 0 failed |
| Production build | npm run build passed; static export generated |
| Export audit | npm run audit:seo passed; 0 errors |

## Issues discovered and fixed

1. The original sitemap listed every tool without publication/indexability checks. The registry now explicitly marks the existing 30 tools published. New entries must opt in with `published: true`. Disabled, unpublished, placeholder, draft and noindex entries are filtered out. Future published/indexable entries are included automatically without a second URL list.
2. Twenty-four exported pages had no `og:url`. Every page now uses the shared metadata helper to set a self-referencing absolute canonical and matching Open Graph URL. Existing titles, descriptions, images and page designs are preserved. All original canonical URLs already matched the intended routes.
3. There was no reusable export-level HTTP/XML/HTML audit. The new audit checks sitemap membership against the registry, fetches each route without following redirects, parses metadata, follows internal navigation, validates fragments and breadcrumb destinations, verifies assets, checks for thin/404 content, and confirms all tools are directly linked from both homepage and directory.
4. Registry status now also controls tool-page noindex metadata. Duplicate registry routes and malformed URL paths fail validation instead of silently entering the sitemap.
5. The original robots policy was already correct and remains allow-all. It now shares the same hardcoded production origin as the sitemap/metadata helper. Next.js emits `User-Agent`, which is equivalent to `User-agent`.

No trustworthy editorial modification dates exist, so lastModified is intentionally omitted. Priority and changeFrequency are also omitted. XML uses `http://www.sitemaps.org/schemas/sitemap/0.9` and native Next.js serialization. Static export and trailingSlash remain enabled.

No existing tool slugs, homepage design, engines, GTM implementation, frontend architecture or npm dependencies were changed. The export audit also checks that each page retains one GTM loader with GTM-WDSPZP27. Existing analytics tests continue to pass.

## Files modified or added

- `lib/catalog.mjs`: explicit publication state, publication/indexability predicates, filtered public tool list and tool routes.
- `lib/seo.mjs`: shared hardcoded production origin, strict canonical URL generation, sitemap entries and page metadata.
- `app/sitemap.js`: native static metadata route generated from the registry.
- `app/robots.js`: native static robots route referencing the shared production origin.
- All 36 page modules listed below: wrap existing editorial metadata with `pageMetadata`; page content is unchanged.
- `tests/seo.test.mjs`: coverage, normalization, duplicate rejection, future tools, status exclusions, metadata and robots regression tests.
- `scripts/audit-seo.py`: dependency-free Python standard-library XML/HTML/HTTP export audit.
- `package.json`: adds `npm run audit:seo`; no dependency changes.
- `README.md`: SEO maintenance and verification instructions.
- `SEO-AUDIT.md`: this report.
- `seo-audit-results.json`: per-page machine-readable evidence including actual titles, descriptions, canonical/OG URLs and HTTP status.
- `test-results.log` and `build-results.log`: latest verification output.

- `app/page.jsx`
- `app/tools/page.jsx`
- `app/about/page.jsx`
- `app/privacy/page.jsx`
- `app/terms/page.jsx`
- `app/contact/page.jsx`
- `app/3d-floor-plan-generator/page.jsx`
- `app/3d-room-planner/page.jsx`
- `app/3d-css-transform-generator/page.jsx`
- `app/gcode-viewer/page.jsx`
- `app/3d-graphing-calculator/page.jsx`
- `app/3d-vase-generator/page.jsx`
- `app/lithophane-maker/page.jsx`
- `app/3d-cookie-cutter-generator/page.jsx`
- `app/3d-nameplate-generator/page.jsx`
- `app/3d-keychain-generator/page.jsx`
- `app/3d-text-generator/page.jsx`
- `app/3d-logo-generator/page.jsx`
- `app/book-cover-mockup-generator/page.jsx`
- `app/box-mockup-generator/page.jsx`
- `app/bottle-mockup-generator/page.jsx`
- `app/t-shirt-mockup-generator/page.jsx`
- `app/mug-mockup-generator/page.jsx`
- `app/3d-model-viewer/page.jsx`
- `app/3d-printing-cost-calculator/page.jsx`
- `app/stl-volume-calculator/page.jsx`
- `app/stl-viewer/page.jsx`
- `app/obj-viewer/page.jsx`
- `app/glb-viewer/page.jsx`
- `app/gltf-viewer/page.jsx`
- `app/fbx-viewer/page.jsx`
- `app/glb-to-stl/page.jsx`
- `app/stl-to-obj/page.jsx`
- `app/svg-to-stl/page.jsx`
- `app/obj-to-stl/page.jsx`
- `app/360-image-viewer/page.jsx`

## Reproduce the checks

```sh
npm test
npm run build
npm run audit:seo
```

The export audit needs Python 3 in addition to the project's existing Node/npm installation; it installs no packages. Run it after every build, because it validates the files in `out/`. It fails with a nonzero exit status if a check fails and writes `seo-audit-results.json`. The 36/30 counts intentionally act as a current-inventory regression check; update those assertions when intentionally publishing additional tools.

## Remaining deployment verification

- Live requests to https://threemelo.com/, /sitemap.xml and /robots.txt could not be completed from this environment (web access failed; direct curl could not connect). This does not establish that the production site is down.
- Publish the verified `out/` artifact, then verify all canonical URLs return HTTP 200 without redirects on the actual host. Check actual HTTP X-Robots-Tag headers, CDN/cache behavior, and rendering-resource availability.
- Verify host redirects for HTTP to HTTPS, www to non-www, non-trailing-slash page paths, and explicit `/index.html` variants. Static exports contain index.html files; a local file server can serve those aliases. The sitemap and internal links emit only canonical slash URLs, but host-level duplicate-variant normalization cannot be guaranteed by static HTML and was not verified here. Canonical links on those files point to the intended slash URL.
- Ensure unknown live routes return HTTP 404 rather than a catch-all HTTP 200. The local audit server returns 404 for an unknown route; final hosting behavior remains unverified. The content check found no empty/404 pages, but Google?s own soft-404 classification is not predictable from local checks alone.
- Submit https://threemelo.com/sitemap.xml in Google Search Console and Bing Webmaster Tools after deployment. Account ownership, submission, crawl eligibility under live hosting, and actual indexing have not been verified.

There are no known export-level blockers. Live production readiness remains conditional on the hosting checks above.

## Complete verified URL inventory

Every URL below returned HTTP 200 locally with exactly one matching canonical, one matching Open Graph URL, unique title/description, and no blocking robots directive.

1. https://threemelo.com/
2. https://threemelo.com/tools/
3. https://threemelo.com/about/
4. https://threemelo.com/privacy/
5. https://threemelo.com/terms/
6. https://threemelo.com/contact/
7. https://threemelo.com/3d-floor-plan-generator/
8. https://threemelo.com/3d-room-planner/
9. https://threemelo.com/3d-css-transform-generator/
10. https://threemelo.com/gcode-viewer/
11. https://threemelo.com/3d-graphing-calculator/
12. https://threemelo.com/3d-vase-generator/
13. https://threemelo.com/lithophane-maker/
14. https://threemelo.com/3d-cookie-cutter-generator/
15. https://threemelo.com/3d-nameplate-generator/
16. https://threemelo.com/3d-keychain-generator/
17. https://threemelo.com/3d-text-generator/
18. https://threemelo.com/3d-logo-generator/
19. https://threemelo.com/book-cover-mockup-generator/
20. https://threemelo.com/box-mockup-generator/
21. https://threemelo.com/bottle-mockup-generator/
22. https://threemelo.com/t-shirt-mockup-generator/
23. https://threemelo.com/mug-mockup-generator/
24. https://threemelo.com/3d-model-viewer/
25. https://threemelo.com/3d-printing-cost-calculator/
26. https://threemelo.com/stl-volume-calculator/
27. https://threemelo.com/stl-viewer/
28. https://threemelo.com/obj-viewer/
29. https://threemelo.com/glb-viewer/
30. https://threemelo.com/gltf-viewer/
31. https://threemelo.com/fbx-viewer/
32. https://threemelo.com/glb-to-stl/
33. https://threemelo.com/stl-to-obj/
34. https://threemelo.com/svg-to-stl/
35. https://threemelo.com/obj-to-stl/
36. https://threemelo.com/360-image-viewer/
