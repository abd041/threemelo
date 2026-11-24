# ThreeMelo pre-deployment audit — Phase 30

## Decision: conditional NO-GO
Source audit and automated tests passed. Production build and browser acceptance testing are blocked because npm dependencies are not installed and registry DNS resolution failed. Do not treat this as a production-ready certification.

## Results
- Baseline: 190 unit tests passed. Updated: 224 tests passed (34 new source-level deployment checks).
- All 30 tool routes individually checked for a single H1, canonical, description, Open Graph, WebApplication schema, FAQ heading, component presence, directory link and valid literal related links.
- 152 JavaScript/JSX files parsed with TypeScript's parser (syntax only, not type checking or bundling).
- Sitemap and shared catalog include 30 unique tools and six indexable core pages, including Contact. The official support address is everydaytools.pro@gmail.com.
- No live HTTP status, browser WebGL, export accuracy, accessibility conformance, Core Web Vitals or search indexing measurements were made.

## Improvements
Shared catalog and categorized responsive directory on home and tools pages; search-oriented homepage H1; corrected about page; unique core-page descriptions; configurable support email; focus styles, skip link, mobile navigation and controls; offscreen animation-frame render guard in most Three.js engines; text editor capture guard to avoid animation loop overwriting a pending image export. These browser-facing changes need acceptance testing.

## Individual tool acceptance checklist
For each row, source route/SEO/link checks passed; prior unit tests cover selected pure utility logic, not complete UI or WebGL behavior. Run the browser checks below on desktop and mobile.

| Tool | Browser acceptance check (pending) |
|---|---|
| 3D Text Generator | Fonts, extrusion, multiline, undo, PNG/JPG/STL/OBJ/GLB exports |
| STL Viewer | Binary and ASCII files, metrics, measurement, export |
| OBJ Viewer | OBJ + MTL + textures, material appearance, exports |
| 360 Image Viewer | 2:1 image, pan, zoom, projections, screenshot, motion permission |
| GLB Viewer | Static embedded materials and textures, measurements, export |
| GLTF Viewer | External BIN and textures, missing asset message |
| FBX Viewer | Static ASCII and binary files, texture handling |
| STL to OBJ | Worker conversion and OBJ reimport |
| OBJ to STL | Binary/ASCII download and STL reimport |
| 3D Model Viewer | All five formats and companion assets |
| 3D Logo Generator | Filled SVG with hole, extrusion, downloads |
| Book Cover Mockup | Three artwork faces, presets, transparent PNG |
| Box Mockup | Six face images, orientation, PNG and GLB |
| Mug Mockup | Wrap placement, handle, hollow geometry, exports |
| 3D Printing Cost Calculator | Manual and STL estimates, currency labels, CSV |
| STL Volume Calculator | Known cube, open mesh, units and CSV |
| 3D Keychain Generator | Text fit, hole, STL slicer repair check |
| 3D Nameplate Generator | Text fit, stand, slicer repair check |
| Bottle Mockup | Label wrapping, dimensions, PNG and GLB |
| SVG to STL | Filled shapes, holes, thickness and STL reimport |
| Cookie Cutter | Presets, custom outline, slicer validation |
| Lithophane Maker | Flat and curved images, thickness, STL |
| Vase Generator | Profiles, ribs, twist and mesh dimensions |
| 3D Graphing Calculator | Equations, invalid inputs, parametric plot, PNG |
| G-Code Viewer | Sample and real file, layer controls, travel paths |
| GLB to STL | Transform preservation, unit scaling, STL reimport |
| T-Shirt Mockup | Both artwork faces, positioning, PNG and GLB |
| 3D CSS Transform | Live preview, copy, CSS download, reduced motion |
| 3D Room Planner | Furniture placement, touch, save/import, PNG |
| 3D Floor Plan | Rooms, doors/windows, overlaps, 3D, SVG/JSON |

## Release gates
1. Support email is everydaytools.pro@gmail.com, with the same address as the fallback for NEXT_PUBLIC_SUPPORT_EMAIL. Google Tag Manager GTM-WDSPZP27 is hardcoded for production. Analytics storage stays denied until consent. Do not enable advertising. A GA4 tag is not included in the site code.
2. Install dependencies with network access, review npm audit and lockfile, run npm test and npm run build. Commit lockfile after successful installation. Static output is out/; use a static server to test it.
3. Test every route at mobile and desktop widths, keyboard access, WebGL unavailable fallback, malformed files, sample models, actual downloads and reimports. Check console errors and memory on repeated navigation. Use Lighthouse for measured performance and accessibility.
4. Review remaining per-tool limitations in README, especially geometry printability, unsupported compressed/animated models and layout accuracy. No new advanced geometry or rendering capabilities were added during this audit.
5. Verify actual deployment URLs, robots.txt, sitemap.xml, canonical tags and HTTP status. Configure a GA4 tag in Google Tag Manager only after checking Consent Mode, and do not add AdSense or remarketing.
