# ThreeMelo — Phase 1
Static Next.js App Router website and client-only Three.js text editor.

## Run locally
Requires Node.js 20+ and npm.

```sh
npm install
npm test
npm run dev
```
Open http://localhost:3000/3d-text-generator/.

## Build and deploy
`npm run build` produces `out/`. Deploy using Vercel's Next.js preset or any static host. Set domain to threemelo.com. No backend is required. Support mail defaults to everydaytools.pro@gmail.com. Set `NEXT_PUBLIC_SUPPORT_EMAIL` only to override that address.

## Features
Six bundled typeface variants, per-glyph extrusion, multiline alignment, spacing, bevel, two materials, environment lighting, orbit controls, eight presets, local saving, JSON import/export, PNG/JPG/GLB/OBJ/STL export. Image width up to 3840 pixels; height follows viewport aspect ratio. OBJ/STL export geometry only; GLB retains materials. STL is not guaranteed watertight or print-ready. Fonts have limited character coverage; complex shaping and emoji not supported. Google Tag Manager is installed for production builds. Analytics storage stays denied until a visitor allows it. Advertising, remarketing, paid APIs and accounts are not used. A GA4 tag is not included in the site code.

## Before launch
- Install dependencies and run build; npm registry was inaccessible in the creation environment, so no dependency lockfile or browser/build verification is available.
- Verify all bundled font imports and review upstream font licenses before publishing.
- Test WebGL on desktop/mobile, all fonts, all export formats, transparent PNG, project save/load, and browser memory usage. Check exported geometry in independent viewers.
- Support email is everydaytools.pro@gmail.com. The contact page only prepares a mailto draft. The privacy policy covers the consent choice. Do not add advertising tags. A GA4 tag is not included in the site code.
- Verify metadata/sitemap after deployment and submit Search Console.
- This is a first implementation, not a fully tested production release. Advanced gradients, shadows, texture uploads, 20+ fonts and animation export are not included.

## Phase 2 — STL Viewer

Open `/stl-viewer/`. Supports binary and ASCII STL, sample geometry, local drag/drop, camera views, wireframe/points, measurement, uniform scaling, rotation, centering and PNG/STL/OBJ/GLB exports. Limits: 50 MB and 1 million triangles. Exact-coordinate edge closure check is limited to 100,000 triangles; estimated volume is not certified, and STL units are unspecified. Metrics reflect original axis-aligned dimensions multiplied by applied uniform scale (not rotated bounding box). Large files may block the main thread temporarily. Browser/WebGL and production build are not verified in this environment; run `npm install`, `npm test`, `npm run build`, and manually test imports, exports, fullscreen, and mobile interactions before deployment. The Phase 1 text generator is retained.

## Phase 3
- `/obj-viewer/`: OBJ polygon meshes, optional MTL and local texture images selected together; filename matching uses basenames. No remote textures are fetched. Geometry statistics, transforms, measurement, PNG/STL/OBJ/GLB exports. OBJ/STL exports do not include material files.
- `/360-image-viewer/`: 2:1 equirectangular panoramic JPG/PNG/WebP, perspective/fisheye/little-planet shader projections, touch and keyboard controls, optional basic device orientation, auto rotation, fullscreen and PNG screenshots. Includes a procedurally drawn sample (not a photograph). Ordinary photos are not converted into real panoramas. Device orientation accuracy depends on hardware and orientation.
- Existing tools retained; homepage, directory, sitemap and related links updated.
- Verification: Node unit tests and source syntax checks only. Run `npm install`, `npm run build` and browser smoke tests before deployment. WebGL, materials, motion and exports have not been browser verified.

## Phase 4 — GLB Viewer

Route: `/glb-viewer/`. Local GLB 2.0 loading, embedded textures and materials, static mesh statistics, camera presets, measurement, transforms and PNG/STL/OBJ/GLB export. File limit 50 MB; mesh limit one million triangles (checked after parsing). External URLs blocked. Uncompressed static triangle meshes only: no Draco, Meshopt, KTX2, skins, morph targets, instancing, or animation playback. Exports are not lossless; STL/OBJ geometry only. The viewer adapts the OBJ engine rather than fully consolidating the engines. Unit tests cover container validation and existing utilities, not WebGL. Browser, texture and export tests and production build remain unverified.

## Phase 5 — GLTF Viewer
Route `/gltf-viewer/`. Shared GLB renderer; select one glTF 2.0 JSON file together with referenced BIN and PNG/JPEG/WebP assets (50 MB combined). Unique filenames are required; remote URLs and path traversal are rejected. Static uncompressed triangle meshes only; animation playback, skinning, morph targets and compressed assets are unsupported. GLB export is not lossless. Unit tests cover resource resolution and rejection paths; browser/WebGL and production build remain unverified in this environment.

## Phase 6: FBX Viewer
Route `/fbx-viewer/`. Reuses the GLB/glTF workspace and adds Three.js FBXLoader. Select one FBX and optional PNG/JPEG/WebP textures (50 MB total); textures match by unique case-insensitive basename. Remote texture requests are blocked. Static polygon meshes only; no animation playback, skinning or morph targets. Raw scene units are not converted to physical units. Exports are not lossless FBX conversions. The triangle limit is checked after parsing; large or malformed files can still exhaust browser resources. Unit tests cover asset selection and path handling, not actual FBX decoding. Production build, WebGL, texture decoding and downloads remain unverified without installed dependencies/browser.

## Phase 7 — STL to OBJ converter
Route `/stl-to-obj/`. Converts binary and conventional ASCII STL to triangle-only OBJ in a browser worker. Optional positive scaling and exact-coordinate vertex deduplication. No materials, normals, UV generation, mesh repair, or cloud processing. Maximum 50 MB and one million triangles; device memory may limit practical use. Unit tests cover conversion; browser worker, download and production build remain unverified.

## Phase 8 — OBJ to STL
Route: /obj-to-stl/. Local worker, binary or ASCII output, scale control. Triangles and convex planar faces only; triangulate complex faces first. Materials discarded; no mesh repair. Browser and production build not verified.

## Phase 9 — Universal 3D Model Viewer

Route: `/3d-model-viewer/`. One shared workspace automatically selects the STL, OBJ, GLB, glTF or FBX loader from the selected model extension. Select exactly one model with its companion assets, up to 50 MB combined. Static polygon meshes only; maximum one million triangles (checked after parsing for some formats). OBJ supports one MTL file with local textures matched by filename. Missing OBJ textures cause an error. No remote resource loading is intended. Units are meters for glTF and raw scene coordinates for other formats. Exports are static and not lossless; no animation playback or compressed glTF support. Existing format-specific pages remain available. Unit tests cover selection and validation, not actual WebGL rendering or decoding. Run `npm install`, `npm test`, `npm run build` and manually test representative files before deployment.

## Phase 10: 3D Logo Generator
Route: `/3d-logo-generator/`. Upload filled SVG paths, adjust depth/bevel/material/light, orbit and export PNG, GLB, OBJ or binary STL. SVG size limit 500 KB; up to 200 filled shapes. Shared front/side materials replace original artwork colors. SVG text, strokes, gradients, filters, embedded images and external references are not reproduced; convert text/strokes to outlines. Overlapping geometry is not unioned; STL printability is not guaranteed. Validation tests do not verify actual SVGLoader tessellation or browser exports. Production build and WebGL testing remain unverified.

## Phase 11 — Book Cover Mockup Generator
Route `/book-cover-mockup-generator/`. Separate front/back/spine PNG, JPEG and WebP artwork, paperback/hardcover, dimensions, colors, lighting, orbit controls and PNG export. Local images capped at 20 MB / 32 MP, textures downsampled to 2048px. Art stretches to face dimensions; no full-wrap cropping or print-ready KDP template. PNG output preserves viewport aspect and caps longest edge at 4096 or device texture limit. Browser/WebGL and Next production build still require verification.

## Phase 12: 3D Box Mockup Generator

Route: `/box-mockup-generator/`. Six independent face artwork slots, five rectangular presets, dimensions, matte/glossy/kraft appearance, camera controls, lighting, optional ground shadow, transparent PNG and GLB export. Images are local, limited to 20 MB and 32 megapixels per image, resized to 2048 pixels maximum edge. Artwork stretches to fit; face aspect ratios are shown. GLB geometry is normalized, not physical scale. Kraft is a color/roughness approximation; no dielines or open flaps. Ground shadows are disabled for transparent exports. Unit tests cover dimension and preset utilities; browser rendering, exports and production build are unverified in this environment.

### Phase 13 — Mug mockup generator
Adds `/mug-mockup-generator/` with hollow ceramic geometry, adjustable handle, artwork wrap angle and rotation, exterior/interior colors, finish, lighting, camera presets, PNG and GLB export. Artwork is stretched to the selected wrap region and capped at 2048 px per edge (20 MB input, 32 MP decoded). Dimensions are normalized in GLB; presets are visual, not certified capacities or print templates. Unit tests cover dimensions and wrap ratios; browser rendering and exports require verification after npm install.

## Phase 14 — 3D Printing Cost Calculator
Route: `/3d-printing-cost-calculator/`. Manual slicer weight and duration, filament prices, electricity, machine wear, labor, extra costs, material allowance, markup, quantity and CSV export. Currency selection changes labels only. Optional local STL worker estimates weight from closed mesh volume, explicit units, approximate material density and effective solid fraction; 50 MB and 100,000 triangle limits. Not a slicer; cannot predict print duration, support material or true infill. No additional dependencies. 90 Node unit tests pass; browser and production build remain unverified.

## Phase 15 — STL Volume Calculator
Local binary/ASCII STL analysis with worker, 100,000 triangle limit, unit and scale conversion, surface area, closed-edge check, solid mass, existing Three.js preview and CSV. Edge validation does not prove manifold topology or exclude self-intersection. Preview uses original geometry. Browser and production build not verified.

### Phase 16 — 3D Keychain Generator
Route `/3d-keychain-generator/`. Three base shapes, three bundled font variants, adjustable millimeter dimensions, ring hole, raised text, colors, local PNG/GLB/STL export. STL contains overlapping base and text shells, not a guaranteed watertight union; repair/union and inspect in slicer before printing. GLB is a visual model in raw coordinates (not converted to meters). Fonts support basic Latin text only. Browser and production build not verified here.

### Phase 17 — 3D Nameplate Generator
Route `/3d-nameplate-generator/`. Upright plate, rear desk stand, raised Latin lettering, three fonts and size presets, local PNG/GLB/STL exports. STL coordinates are millimeters; plate, stand and text are overlapping shells, not a watertight union. Repair/union and check stability in a slicer. GLB uses raw coordinates, not meters. Unit tests cover layout and validation, not geometry rendering. Browser and production build remain unverified.

## Phase 18: Bottle mockup generator
Route `/bottle-mockup-generator/`. Four exterior bottle presets, adjustable radius, body height, neck ratio, cap height, label wrap, rotation, height and position. Local PNG/JPEG/WebP artwork (20 MB, 32 megapixels; resized to 2048px), matte/glossy opaque finishes, camera controls, transparent PNG and normalized GLB export. This is a promotional mockup, not hollow CAD geometry or a calibrated print template. Transparent glass/refraction is not implemented. Browser rendering and exports require local verification.

### Phase 19 — SVG to STL Converter
Route: `/svg-to-stl/`. Local SVG outline extrusion, longest-side sizing (5–300 mm), thickness (0.5–50 mm), curve detail, wireframe and binary/ASCII STL export. Limits: 500 KB, 200 shapes, 500,000 generated triangles (checked after each shape). Separate shells are not Boolean-unioned; validate in a slicer. Browser/WebGL/export and production build remain unverified.

### Phase 20 — 3D Cookie Cutter Generator
Route: `/3d-cookie-cutter-generator/`. Five presets or one filled SVG silhouette (no holes, 500 KB, up to 512 sampled points), adjustable inside size, wall, height and grip rim. Tapered cutting edge, local Three.js preview, binary/ASCII STL. Edge validation and outline self-intersection checks are included; full 3D intersection detection and slicer/food-contact certification are not included. Browser rendering, SVG parsing integration, downloads and production build remain unverified in this environment. No new dependencies.

### Phase 21 — Lithophane Maker
Route `/lithophane-maker/`. Local PNG/JPEG/WebP decoding (20 MB, 32 megapixels, checked after decode), luminance sampling up to 150 pixels per side, flat/curved relief, adjustable millimeter dimensions and thickness, invert brightness, approximate 2D backlight preview, Three.js orbit controls and binary/ASCII STL. Curved width is rear arc length; no frame or stand. Sampling and geometry run on the main thread. Geometry tests cover closed edges, flat volumes and curved closure; no slicer validation or physical optical calibration. Browser rendering, image decoding, downloads and production build remain unverified. No new dependencies.

### Phase 22 — 3D Vase Generator
Route `/3d-vase-generator/`. Four profiles, explicit inner and outer walls, solid base and open mouth, adjustable reference diameter, height, radial wall and base thickness, rib count/amplitude and twist. Local Three.js preview, color, wireframe, mesh metrics and binary/ASCII STL. Seven new Node tests cover closed edges, volume and validation (144 total). Radial thickness differs from normal thickness, reference diameter is not actual width, STL uses mm with Y upright. Slicer compatibility, physical waterproofing, full self-intersection detection, browser exports and production build are not verified. No new dependencies.

### Phase 23: 3D Graphing Calculator
Route: `/3d-graphing-calculator/`. Supports explicit z=f(x,y) and parametric x,y,z expressions in u,v, four presets, bounded domains, adjustable sampling, height colors, wireframe, grid/axes and viewport PNG. Use explicit multiplication, radians and the Plot graph button. Restricted expression parser does not execute arbitrary JS. Sampled discontinuities can be missed; implicit equations, multiple simultaneous surfaces and labeled tick marks are not implemented. Browser/WebGL/PNG and production build remain unverified. Unit tests: 152 passing.

### Phase 24 — G-Code Viewer
Route `/gcode-viewer/`. Local worker parser for linear G0/G1, absolute/relative XYZ and E, G20/G21 and G92 coordinate reset approximation. Z-level filtering, extrusion/travel colors, orbit controls, sample, path statistics. Limits 20 MB and 300,000 moves. No arcs, firmware offsets, homing, macros, multi-tool simulation, collision checks or exact time estimation. Z levels inferred from endpoints; positive E includes priming/unretraction. Browser/WebGL/worker integration and production build not verified. No new dependencies.

### Phase 25: GLB to STL Converter
`/glb-to-stl/` adds local static GLB preview, unit conversion (meters to millimeters by default), scaling and binary/ASCII STL downloads. No new dependencies. Supports existing GLB loader restrictions. No repair or printability certification. Unit tests cover scale and filename helpers; browser and production build remain unverified.

## Phase 26 — T-shirt mockup generator
Added `/t-shirt-mockup-generator/` with front/back local artwork uploads, independent scale and positioning, shirt color presets, orbit controls, transparent PNG and GLB export. The geometry is a stylized beveled silhouette, not a realistic cloth simulation or manufacturing template. Artwork is limited to 20 MB and 32 megapixels per file, resized to 2048 pixels. Unit tests cover placement math; WebGL, browser downloads and production build remain unverified.

## Phase 27 — 3D CSS Transform Generator
Route `/3d-css-transform-generator/`. Native CSS 3D cube/card preview, perspective, XYZ rotation/translation/scale, XY transform origin, six presets, spin/float/flip animation, pause/reset, copy and CSS download. Reduced-motion support. Export includes transform and animation rules, not the preview cube HTML or face styles. No new dependencies. Seven new utility tests (177 total) pass. Browser preview, clipboard/download and production build remain unverified.

## Phase 28 — 3D Room Planner
Route `/3d-room-planner/`. Rectangular room, two cutaway walls, seven simplified furniture types, top-view pointer dragging, numeric sliders, color controls, local save/load, JSON import/export and viewport PNG. Maximum 60 objects. Furniture may overlap or exceed room bounds if oversized; no collision checks, doors, windows, irregular walls or construction drawings. Browser/WebGL and production build not verified.

## Phase 29 — 3D Floor Plan Generator

`/3d-floor-plan-generator/` supports up to 20 non-overlapping rectangular rooms, editable coordinates and dimensions, floor colors, door/window openings, SVG top view, lazy-loaded Three.js orbit preview, total area, local save/load, JSON import/export and SVG download. Shared walls are modeled independently; openings are not synchronized across adjoining rooms. Not a construction or code-compliance tool. No new dependencies. 190 Node unit tests passed; production build unavailable because Next.js dependencies are not installed. Browser and WebGL integration remain unverified.

## Phase 30: pre-deployment source audit
See `AUDIT.md` for results and browser acceptance checklist. `npm test` passed 224 tests in the audit environment. Dependency installation and production build remain blocked by registry DNS. The contact page is indexable and included in the sitemap. It prepares a mailto draft to everydaytools.pro@gmail.com and does not send mail itself. The static site builds to `out/` once dependencies are available.

## Phase 31 — Premium homepage
- Editorial hero with original local SVG artwork, featured tools, format strip, workflow section, FAQ, and final CTA.
- Shared searchable tool directory with category filters, result count, clear and empty states; all 30 links are rendered in the default state.
- Responsive layouts, keyboard-visible focus, reduced-motion support, explicit home metadata and PNG social preview.
- No new dependencies or WebGL scene on the homepage. The existing 30 tool pages and engines are unchanged.
- 231 Node unit/source tests pass. Changed JSX files parse successfully. Full Next.js build and interactive browser QA remain blocked by unavailable npm dependencies; visual quality and performance are not independently scored.

## Contact
The public mailbox is everydaytools.pro@gmail.com. `lib/site.mjs` reads `NEXT_PUBLIC_SUPPORT_EMAIL` and falls back to that address, so a Vercel environment variable is optional. The contact page is a browser-only form: it validates locally, then opens a mailto draft or a Gmail compose tab. It does not call an email API, store submissions, or report that a message was sent. Contact is indexable and listed in the sitemap with the 30 tool routes and the other core pages.


## Production GTM and consent

The root `app/layout.jsx` contains the official asynchronous loader for the hardcoded `GTM-WDSPZP27` container. No GTM environment configuration is needed. Next.js's built-in production build flag prevents development loading. Consent Mode v2 defaults to denied before the loader runs; the container itself waits for analytics opt-in. Advertising remains denied. Cookie preferences are available in the footer, including withdrawal and cross-tab updates. If local storage is unavailable, consent works for the current page.

The official noscript iframe is retained behind `NOSCRIPT_CONSENT_VERIFIED = false`. A static export cannot read browser consent without JavaScript, so it must not serve that iframe. Do not enable it globally. Supporting consented no-JavaScript tracking would require a different hosting architecture.

`lib/analytics.mjs` exposes `track(event, parameters)` and `trackDownload(filename)` (the filename is used locally only to derive an approved format). Events drop arbitrary labels, text, contact fields, filenames, URLs, and unknown page paths. All tools share open, interaction, upload and error instrumentation; completed artifact preparation calls the download helper directly, including detached download links. Preset events report selection without its value. Search reports only result count. Conversion completion means a converter prepared an export, not that the browser saved it. No events collected before consent are replayed.

### Required GTM / GA4 dashboard configuration

1. Preview container **GTM-WDSPZP27**. Configure a Google tag with your GA4 measurement ID; set `send_page_view` to **false**, `allow_google_signals` to **false**, and `allow_ad_personalization_signals` to **false**. Require additional `analytics_storage` consent for every measurement tag. Keep Ads, remarketing, User-ID, user-provided data and AdSense disabled.
2. Define Data Layer Variables for `page_path`, `page_location`, `page_referrer`, `tool`, `format`, `category`, `result_count` and `action`. Map page location and referrer on the Google tag and all GA4 events to the sanitized data-layer values, never built-in Page URL / Referrer. Default referrer to an empty string and location to `https://threemelo.com/` if unavailable. Do not use DOM text, form fields, filenames or query strings as variables.
3. Send GA4 events using only exact custom-event triggers for `page_view`, `tool_open`, `tool_interaction`, `file_upload`, `file_download`, `model_export`, `conversion_complete`, `preset_selected`, `tool_search`, `category_selected`, `tool_error`, and `contact_email_open`. Pass only the approved parameters relevant to each event. Initialize the Google tag once when GTM loads. Do not add an All Pages or History Change page-view tag. The site emits the initial consented page view and subsequent pathname changes, ignoring query/hash changes and repeated renders.
4. Disable GA4 Enhanced Measurement (including automatic page views/history, site search, file downloads, outbound clicks and form interactions) and automatic user-provided data collection. This avoids duplicate events and automatic URL/form collection. Do not add click, form or history triggers in GTM.
5. In Tag Assistant and GA4 DebugView verify: fresh/rejected visits make no GTM requests; acceptance loads one container and one page view; navigation produces one page view; withdrawal stops site events; reacceptance resumes without a second container; advertising consent always stays denied. Check sanitized URLs using a test query string, downloads, presets, search, errors and email opens. Confirm JavaScript-disabled pages make no GTM request, then publish the container.

GA4 collection is **not configured or verified by this code change**. Container configuration is external to the repository. Reference: [Google consent setup](https://developers.google.com/tag-platform/security/guides/consent) and [Next.js Script](https://nextjs.org/docs/app/api-reference/components/script).


## Sitemap and SEO maintenance

The production origin is hardcoded as `https://threemelo.com` in `lib/seo.mjs`; no sitemap environment configuration is needed. Native Next.js metadata routes generate `out/sitemap.xml` and `out/robots.txt`. Every page wraps its existing metadata with `pageMetadata(path, metadata)` so canonical and Open Graph URLs match the sitemap.

Add tools only in `lib/catalog.mjs` and create their App Router page. Set `published: true` when ready. Missing/false publication, `enabled: false`, `disabled: true`, `placeholder: true`, or any non-published `status` excludes a tool from public navigation and the sitemap. `indexable: false`, `noindex: true`, or `robots: {index: false}` excludes it from the sitemap and sets noindex through the metadata helper. Do not manually duplicate tool URLs in the sitemap. Never use build time as a last-modified date.

Run `npm test`, `npm run build`, then `npm run audit:seo`. The last command uses Python 3 standard-library parsers and a temporary local HTTP server to inspect the actual export, including all page metadata, XML, robots, navigation and rendering assets. It requires no Python packages and no deployed server. Deliberate additions to the 30-tool/36-page inventory require updating the regression counts. See `SEO-AUDIT.md` and `seo-audit-results.json` for the latest results and remaining live-host verification.
