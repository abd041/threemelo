/** @typedef {Object} Tool
 * @property {string} slug
 * @property {string} name
 * @property {string} description
 * @property {string} icon
 * @property {string} category
 * @property {string} canonicalPath
 * @property {string[]} keywords
 * @property {string[]} aliases
 * @property {string[]} inputFormats
 * @property {string[]} outputFormats
 * @property {string[]} relatedSlugs
 * @property {boolean} published
 * @property {boolean} featured
 * @property {string} status
 */
/** @type {Tool[]} */
export const toolRegistry = [
  {
    "published": true,
    "slug": "3d-floor-plan-generator",
    "icon": "▦",
    "name": "3D Floor Plan Generator",
    "description": "Design multi-room layouts with doors, windows and 3D preview.",
    "category": "Home & layout",
    "canonicalPath": "/3d-floor-plan-generator/",
    "inputFormats": [
      "JSON"
    ],
    "outputFormats": [
      "SVG",
      "JSON"
    ],
    "keywords": [
      "Home & layout",
      "3d",
      "floor",
      "plan",
      "generator"
    ],
    "aliases": [
      "floorplan",
      "house layout",
      "blueprint"
    ],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "3d-room-planner"
    ]
  },
  {
    "published": true,
    "slug": "3d-room-planner",
    "icon": "⌂",
    "name": "3D Room Planner",
    "description": "Arrange furniture and customize room dimensions and colors.",
    "category": "Home & layout",
    "canonicalPath": "/3d-room-planner/",
    "inputFormats": [
      "JSON"
    ],
    "outputFormats": [
      "PNG",
      "JSON"
    ],
    "keywords": [
      "Home & layout",
      "3d",
      "room",
      "planner"
    ],
    "aliases": [
      "interior",
      "furniture"
    ],
    "featured": true,
    "status": "published",
    "relatedSlugs": [
      "3d-floor-plan-generator"
    ]
  },
  {
    "published": true,
    "slug": "3d-css-transform-generator",
    "icon": "CSS",
    "name": "3D CSS Transform Generator",
    "description": "Preview perspective, rotation and animation, then copy ready-to-use CSS.",
    "category": "Creative & developer tools",
    "canonicalPath": "/3d-css-transform-generator/",
    "inputFormats": [],
    "outputFormats": [
      "CSS"
    ],
    "keywords": [
      "Creative & developer tools",
      "3d",
      "css",
      "transform",
      "generator"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "3d-graphing-calculator",
      "3d-text-generator",
      "3d-logo-generator"
    ]
  },
  {
    "published": true,
    "slug": "gcode-viewer",
    "icon": "G1",
    "name": "G-Code Viewer",
    "description": "Inspect 3D printing extrusion and travel paths by Z level.",
    "category": "3D printing",
    "canonicalPath": "/gcode-viewer/",
    "inputFormats": [
      "G-code"
    ],
    "outputFormats": [],
    "keywords": [
      "3D printing",
      "g-code",
      "viewer"
    ],
    "aliases": [
      "gcode",
      "toolpath"
    ],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "svg-to-stl",
      "stl-viewer",
      "stl-volume-calculator",
      "3d-printing-cost-calculator",
      "3d-vase-generator"
    ]
  },
  {
    "published": true,
    "slug": "3d-graphing-calculator",
    "icon": "ƒ(x)",
    "name": "3D Graphing Calculator",
    "description": "Plot equations and parametric surfaces in interactive 3D.",
    "category": "Creative & developer tools",
    "canonicalPath": "/3d-graphing-calculator/",
    "inputFormats": [],
    "outputFormats": [
      "PNG"
    ],
    "keywords": [
      "Creative & developer tools",
      "3d",
      "graphing",
      "calculator"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "3d-css-transform-generator",
      "3d-text-generator",
      "3d-logo-generator"
    ]
  },
  {
    "published": true,
    "slug": "3d-vase-generator",
    "icon": "♢",
    "name": "3D Vase Generator",
    "description": "Design hollow spiral and ribbed vases with STL export.",
    "category": "3D printing",
    "canonicalPath": "/3d-vase-generator/",
    "inputFormats": [],
    "outputFormats": [
      "STL"
    ],
    "keywords": [
      "3D printing",
      "3d",
      "vase",
      "generator"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "gcode-viewer",
      "lithophane-maker",
      "3d-cookie-cutter-generator",
      "3d-nameplate-generator",
      "3d-keychain-generator"
    ]
  },
  {
    "published": true,
    "slug": "lithophane-maker",
    "icon": "▧",
    "name": "Lithophane Maker",
    "description": "Turn photos into flat or curved relief panels with STL export.",
    "category": "3D printing",
    "canonicalPath": "/lithophane-maker/",
    "inputFormats": [
      "PNG",
      "JPG",
      "WebP"
    ],
    "outputFormats": [
      "STL"
    ],
    "keywords": [
      "3D printing",
      "lithophane",
      "maker"
    ],
    "aliases": [
      "photo to stl",
      "image relief"
    ],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "gcode-viewer",
      "3d-vase-generator",
      "3d-cookie-cutter-generator",
      "3d-nameplate-generator",
      "3d-keychain-generator"
    ]
  },
  {
    "published": true,
    "slug": "3d-cookie-cutter-generator",
    "icon": "☆",
    "name": "3D Cookie Cutter Generator",
    "description": "Create custom cutter shapes with tapered edges and STL export.",
    "category": "3D printing",
    "canonicalPath": "/3d-cookie-cutter-generator/",
    "inputFormats": [
      "SVG"
    ],
    "outputFormats": [
      "STL"
    ],
    "keywords": [
      "3D printing",
      "3d",
      "cookie",
      "cutter",
      "generator"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "gcode-viewer",
      "3d-vase-generator",
      "lithophane-maker",
      "3d-nameplate-generator",
      "3d-keychain-generator"
    ]
  },
  {
    "published": true,
    "slug": "3d-nameplate-generator",
    "icon": "Aa",
    "name": "3D Nameplate Generator",
    "description": "Create personalized desk nameplates with raised text and adjustable stands.",
    "category": "3D printing",
    "canonicalPath": "/3d-nameplate-generator/",
    "inputFormats": [],
    "outputFormats": [
      "STL",
      "GLB",
      "PNG"
    ],
    "keywords": [
      "3D printing",
      "3d",
      "nameplate",
      "generator"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "gcode-viewer",
      "3d-vase-generator",
      "lithophane-maker",
      "3d-cookie-cutter-generator",
      "3d-keychain-generator"
    ]
  },
  {
    "published": true,
    "slug": "3d-keychain-generator",
    "icon": "◉",
    "name": "3D Keychain Generator",
    "description": "Create personalized name tags with custom dimensions and ring holes.",
    "category": "3D printing",
    "canonicalPath": "/3d-keychain-generator/",
    "inputFormats": [],
    "outputFormats": [
      "STL",
      "GLB",
      "PNG"
    ],
    "keywords": [
      "3D printing",
      "3d",
      "keychain",
      "generator"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "gcode-viewer",
      "3d-vase-generator",
      "lithophane-maker",
      "3d-cookie-cutter-generator",
      "3d-nameplate-generator"
    ]
  },
  {
    "published": true,
    "slug": "3d-text-generator",
    "icon": "Aa",
    "name": "3D Text Generator",
    "description": "Create and export custom 3D typography.",
    "category": "Creative & developer tools",
    "canonicalPath": "/3d-text-generator/",
    "inputFormats": [
      "JSON"
    ],
    "outputFormats": [
      "PNG",
      "JPG",
      "GLB",
      "OBJ",
      "STL",
      "JSON"
    ],
    "keywords": [
      "Creative & developer tools",
      "3d",
      "text",
      "generator"
    ],
    "aliases": [],
    "featured": true,
    "status": "published",
    "relatedSlugs": [
      "3d-logo-generator",
      "3d-model-viewer",
      "3d-css-transform-generator",
      "3d-graphing-calculator"
    ]
  },
  {
    "published": true,
    "slug": "3d-logo-generator",
    "icon": "◈",
    "name": "3D Logo Generator",
    "description": "Extrude SVG logos with metallic finishes and custom colors.",
    "category": "Creative & developer tools",
    "canonicalPath": "/3d-logo-generator/",
    "inputFormats": [
      "SVG"
    ],
    "outputFormats": [
      "PNG",
      "GLB",
      "OBJ",
      "STL"
    ],
    "keywords": [
      "Creative & developer tools",
      "3d",
      "logo",
      "generator"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "3d-text-generator",
      "3d-model-viewer",
      "3d-css-transform-generator",
      "3d-graphing-calculator"
    ]
  },
  {
    "published": true,
    "slug": "book-cover-mockup-generator",
    "icon": "▣",
    "name": "3D Book Cover Mockup Generator",
    "description": "Create paperback and hardcover promotional images with your own artwork.",
    "category": "Product mockups",
    "canonicalPath": "/book-cover-mockup-generator/",
    "inputFormats": [
      "PNG",
      "JPG",
      "WebP"
    ],
    "outputFormats": [
      "PNG"
    ],
    "keywords": [
      "Product mockups",
      "3d",
      "book",
      "cover",
      "mockup",
      "generator"
    ],
    "aliases": [
      "book mockup",
      "cover design"
    ],
    "featured": true,
    "status": "published",
    "relatedSlugs": [
      "box-mockup-generator",
      "bottle-mockup-generator",
      "mug-mockup-generator",
      "t-shirt-mockup-generator"
    ]
  },
  {
    "published": true,
    "slug": "box-mockup-generator",
    "icon": "▧",
    "name": "3D Box Mockup Generator",
    "description": "Create custom packaging mockups with six-sided artwork.",
    "category": "Product mockups",
    "canonicalPath": "/box-mockup-generator/",
    "inputFormats": [
      "PNG",
      "JPG",
      "WebP"
    ],
    "outputFormats": [
      "PNG",
      "GLB"
    ],
    "keywords": [
      "Product mockups",
      "3d",
      "box",
      "mockup",
      "generator"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "book-cover-mockup-generator",
      "bottle-mockup-generator",
      "mug-mockup-generator",
      "t-shirt-mockup-generator"
    ]
  },
  {
    "published": true,
    "slug": "bottle-mockup-generator",
    "icon": "▥",
    "name": "3D Bottle Mockup Generator",
    "description": "Customize bottle shapes, caps and wraparound product labels.",
    "category": "Product mockups",
    "canonicalPath": "/bottle-mockup-generator/",
    "inputFormats": [
      "PNG",
      "JPG",
      "WebP"
    ],
    "outputFormats": [
      "PNG",
      "GLB"
    ],
    "keywords": [
      "Product mockups",
      "3d",
      "bottle",
      "mockup",
      "generator"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "book-cover-mockup-generator",
      "box-mockup-generator",
      "mug-mockup-generator",
      "t-shirt-mockup-generator"
    ]
  },
  {
    "published": true,
    "slug": "t-shirt-mockup-generator",
    "icon": "TEE",
    "name": "3D T-Shirt Mockup Generator",
    "description": "Customize front and back artwork on a stylized 3D shirt.",
    "category": "Product mockups",
    "canonicalPath": "/t-shirt-mockup-generator/",
    "inputFormats": [
      "PNG",
      "JPG",
      "WebP"
    ],
    "outputFormats": [
      "PNG",
      "GLB"
    ],
    "keywords": [
      "Product mockups",
      "3d",
      "t-shirt",
      "mockup",
      "generator"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "book-cover-mockup-generator",
      "box-mockup-generator",
      "bottle-mockup-generator",
      "mug-mockup-generator"
    ]
  },
  {
    "published": true,
    "slug": "mug-mockup-generator",
    "icon": "☕",
    "name": "3D Mug Mockup Generator",
    "description": "Wrap artwork around a customizable ceramic mug.",
    "category": "Product mockups",
    "canonicalPath": "/mug-mockup-generator/",
    "inputFormats": [
      "PNG",
      "JPG",
      "WebP"
    ],
    "outputFormats": [
      "PNG",
      "GLB"
    ],
    "keywords": [
      "Product mockups",
      "3d",
      "mug",
      "mockup",
      "generator"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "book-cover-mockup-generator",
      "box-mockup-generator",
      "bottle-mockup-generator",
      "t-shirt-mockup-generator"
    ]
  },
  {
    "published": true,
    "slug": "3d-model-viewer",
    "icon": "3D",
    "name": "3D Model Viewer",
    "description": "Open STL, OBJ, GLB, GLTF and FBX in one workspace.",
    "category": "3D viewers",
    "canonicalPath": "/3d-model-viewer/",
    "inputFormats": [
      "STL",
      "OBJ",
      "GLB",
      "glTF",
      "FBX",
      "BMP"
    ],
    "outputFormats": [
      "PNG",
      "STL",
      "OBJ",
      "GLB"
    ],
    "keywords": [
      "3D viewers",
      "3d",
      "model",
      "viewer"
    ],
    "aliases": [
      "open model",
      "inspect mesh"
    ],
    "featured": true,
    "status": "published",
    "relatedSlugs": [
      "3d-text-generator",
      "3d-logo-generator",
      "stl-viewer",
      "obj-viewer",
      "glb-viewer"
    ]
  },
  {
    "published": true,
    "slug": "3d-printing-cost-calculator",
    "icon": "$",
    "name": "3D Printing Cost Calculator",
    "description": "Estimate filament, power, machine wear and selling price.",
    "category": "3D printing",
    "canonicalPath": "/3d-printing-cost-calculator/",
    "inputFormats": [
      "STL"
    ],
    "outputFormats": [
      "CSV"
    ],
    "keywords": [
      "3D printing",
      "3d",
      "printing",
      "cost",
      "calculator"
    ],
    "aliases": [
      "printing cost",
      "price",
      "filament cost"
    ],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "svg-to-stl",
      "stl-viewer",
      "stl-volume-calculator",
      "gcode-viewer",
      "3d-vase-generator"
    ]
  },
  {
    "published": true,
    "slug": "stl-volume-calculator",
    "icon": "V³",
    "name": "STL Volume Calculator",
    "description": "Measure mesh volume, surface area and solid material weight.",
    "category": "3D printing",
    "canonicalPath": "/stl-volume-calculator/",
    "inputFormats": [
      "STL"
    ],
    "outputFormats": [
      "CSV"
    ],
    "keywords": [
      "3D printing",
      "stl",
      "volume",
      "calculator"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "svg-to-stl",
      "stl-viewer",
      "3d-printing-cost-calculator",
      "gcode-viewer",
      "3d-vase-generator"
    ]
  },
  {
    "published": true,
    "slug": "stl-viewer",
    "icon": "◇",
    "name": "STL Viewer",
    "description": "Open, inspect, measure and convert STL models privately in your browser.",
    "category": "3D viewers",
    "canonicalPath": "/stl-viewer/",
    "inputFormats": [
      "STL"
    ],
    "outputFormats": [
      "PNG",
      "OBJ",
      "STL",
      "GLB"
    ],
    "keywords": [
      "3D viewers",
      "stl",
      "viewer"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "svg-to-stl",
      "stl-volume-calculator",
      "3d-printing-cost-calculator",
      "gcode-viewer",
      "glb-viewer"
    ]
  },
  {
    "published": true,
    "slug": "obj-viewer",
    "icon": "OBJ",
    "name": "OBJ Viewer",
    "description": "Inspect OBJ geometry, materials and textures.",
    "category": "3D viewers",
    "canonicalPath": "/obj-viewer/",
    "inputFormats": [
      "OBJ",
      "MTL",
      "PNG",
      "JPG",
      "WebP",
      "BMP"
    ],
    "outputFormats": [
      "PNG",
      "OBJ",
      "STL",
      "GLB"
    ],
    "keywords": [
      "3D viewers",
      "obj",
      "viewer"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "3d-model-viewer",
      "stl-viewer",
      "glb-viewer",
      "gltf-viewer",
      "fbx-viewer"
    ]
  },
  {
    "published": true,
    "slug": "glb-viewer",
    "icon": "GLB",
    "name": "GLB Viewer",
    "description": "Open binary glTF models and inspect embedded materials.",
    "category": "3D viewers",
    "canonicalPath": "/glb-viewer/",
    "inputFormats": [
      "GLB"
    ],
    "outputFormats": [
      "PNG",
      "STL",
      "OBJ",
      "GLB"
    ],
    "keywords": [
      "3D viewers",
      "glb",
      "viewer"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "glb-to-stl",
      "stl-viewer",
      "3d-model-viewer",
      "obj-viewer",
      "gltf-viewer"
    ]
  },
  {
    "published": true,
    "slug": "gltf-viewer",
    "icon": "GLTF",
    "name": "GLTF Viewer",
    "description": "Inspect glTF models with local binary buffers and textures.",
    "category": "3D viewers",
    "canonicalPath": "/gltf-viewer/",
    "inputFormats": [
      "glTF",
      "BIN",
      "PNG",
      "JPG",
      "WebP"
    ],
    "outputFormats": [
      "PNG",
      "STL",
      "OBJ",
      "GLB"
    ],
    "keywords": [
      "3D viewers",
      "gltf",
      "viewer"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "3d-model-viewer",
      "stl-viewer",
      "obj-viewer",
      "glb-viewer",
      "fbx-viewer"
    ]
  },
  {
    "published": true,
    "slug": "fbx-viewer",
    "icon": "FBX",
    "name": "FBX Viewer",
    "description": "Inspect static FBX meshes and local textures.",
    "category": "3D viewers",
    "canonicalPath": "/fbx-viewer/",
    "inputFormats": [
      "FBX",
      "PNG",
      "JPG",
      "WebP"
    ],
    "outputFormats": [
      "PNG",
      "STL",
      "OBJ",
      "GLB"
    ],
    "keywords": [
      "3D viewers",
      "fbx",
      "viewer"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "3d-model-viewer",
      "stl-viewer",
      "obj-viewer",
      "glb-viewer",
      "gltf-viewer"
    ]
  },
  {
    "published": true,
    "slug": "glb-to-stl",
    "icon": "GLB→STL",
    "name": "GLB to STL Converter",
    "description": "Convert static GLB meshes into binary or ASCII STL.",
    "category": "File converters",
    "canonicalPath": "/glb-to-stl/",
    "inputFormats": [
      "GLB"
    ],
    "outputFormats": [
      "STL"
    ],
    "keywords": [
      "File converters",
      "glb",
      "to",
      "stl",
      "converter"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "glb-viewer",
      "stl-viewer",
      "stl-to-obj",
      "svg-to-stl",
      "obj-to-stl"
    ]
  },
  {
    "published": true,
    "slug": "stl-to-obj",
    "icon": "STL→OBJ",
    "name": "STL to OBJ Converter",
    "description": "Convert STL geometry to OBJ locally.",
    "category": "File converters",
    "canonicalPath": "/stl-to-obj/",
    "inputFormats": [
      "STL"
    ],
    "outputFormats": [
      "OBJ"
    ],
    "keywords": [
      "File converters",
      "stl",
      "to",
      "obj",
      "converter"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "glb-to-stl",
      "svg-to-stl",
      "obj-to-stl"
    ]
  },
  {
    "published": true,
    "slug": "svg-to-stl",
    "icon": "SVG→STL",
    "name": "SVG to STL Converter",
    "description": "Extrude filled vector shapes into STL geometry with adjustable dimensions.",
    "category": "File converters",
    "canonicalPath": "/svg-to-stl/",
    "inputFormats": [
      "SVG"
    ],
    "outputFormats": [
      "STL"
    ],
    "keywords": [
      "File converters",
      "svg",
      "to",
      "stl",
      "converter"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "stl-viewer",
      "stl-volume-calculator",
      "3d-printing-cost-calculator",
      "gcode-viewer",
      "glb-to-stl"
    ]
  },
  {
    "published": true,
    "slug": "obj-to-stl",
    "icon": "OBJ→STL",
    "name": "OBJ to STL Converter",
    "description": "Convert polygon geometry to binary or ASCII STL.",
    "category": "File converters",
    "canonicalPath": "/obj-to-stl/",
    "inputFormats": [
      "OBJ"
    ],
    "outputFormats": [
      "STL"
    ],
    "keywords": [
      "File converters",
      "obj",
      "to",
      "stl",
      "converter"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "glb-to-stl",
      "stl-to-obj",
      "svg-to-stl"
    ]
  },
  {
    "published": true,
    "slug": "360-image-viewer",
    "icon": "360°",
    "name": "360° Image Viewer",
    "description": "Explore panoramic photos in an interactive spherical viewer.",
    "category": "3D viewers",
    "canonicalPath": "/360-image-viewer/",
    "inputFormats": [
      "PNG",
      "JPG",
      "WebP"
    ],
    "outputFormats": [
      "PNG"
    ],
    "keywords": [
      "3D viewers",
      "360°",
      "image",
      "viewer"
    ],
    "aliases": [],
    "featured": false,
    "status": "published",
    "relatedSlugs": [
      "3d-model-viewer",
      "stl-viewer",
      "obj-viewer",
      "glb-viewer",
      "gltf-viewer"
    ]
  }
];
// New entries must explicitly opt in to publication. Draft/placeholder tools stay hidden.
export function isPublishedTool(tool) {
  return tool.published === true && tool.enabled !== false && tool.disabled !== true
    && tool.placeholder !== true && (!tool.status || tool.status === 'published');
}
export function isIndexableTool(tool) {
  return isPublishedTool(tool) && tool.indexable !== false && tool.noindex !== true
    && tool.robots?.index !== false;
}
export const tools = toolRegistry.filter(isPublishedTool);
export const categories = [...new Set(tools.map(t=>t.category))];
export const coreRoutes = ["/", "/tools/", "/about/", "/privacy/", "/terms/", "/contact/"];
export const toolRoutes = toolRegistry.filter(isIndexableTool).map(t=>`/${t.slug}/`);
