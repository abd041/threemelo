import {tools} from './catalog.mjs';
export const featuredSlugs=['3d-text-generator','3d-model-viewer','book-cover-mockup-generator','3d-room-planner'].filter(slug=>tools.some(t=>t.slug===slug&&t.featured));
export const homeCategories=['3D viewers','File converters','Product mockups','3D printing','Creative & developer tools','Home & layout'];
export const categoryId = name => name.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-');
export const categoryDescriptions={
 '3D viewers':'Inspect geometry, materials and dimensions in a focused workspace.',
 'File converters':'Move between supported model formats, with local conversion.',
 'Product mockups':'Turn your artwork into customizable product visuals.',
 '3D printing':'Create printable shapes, inspect meshes and estimate material costs.',
 'Creative & developer tools':'Build 3D typography, logos, graphs and CSS transforms.',
 'Home & layout':'Explore floor plans and arrange furniture in three dimensions.'
};
export function filterTools(query='',category='All tools',format='All formats') {
 const terms=query.toLowerCase().replace(/\./g,'').trim().split(/\s+/).filter(Boolean);
 return tools.filter(t=>(category==='All tools'||t.category===category)&&(format==='All formats'||[...t.inputFormats,...t.outputFormats].includes(format))&&terms.every(q=>`${t.name} ${t.description} ${t.category} ${t.slug} ${t.keywords.join(' ')} ${t.aliases.join(' ')} ${t.inputFormats.join(' ')} ${t.outputFormats.join(' ')}`.toLowerCase().includes(q)));
}
export const featuredTools=featuredSlugs.map(slug=>tools.find(t=>t.slug===slug));
export const workflows=[
 {name:'From vector to print',description:'Create geometry, inspect it, then estimate printing costs. Use a separate slicer to generate G-code.',slugs:['svg-to-stl','stl-viewer','stl-volume-calculator','3d-printing-cost-calculator','gcode-viewer']},
 {name:'A product launch toolkit',description:'Reuse your artwork across book covers, packaging and bottle labels.',slugs:['book-cover-mockup-generator','box-mockup-generator','bottle-mockup-generator']},
 {name:'Plan your space',description:'Explore room proportions, then try furniture arrangements.',slugs:['3d-floor-plan-generator','3d-room-planner']},
 {name:'Make a model printable',description:'Inspect a GLB, convert static meshes, and check the resulting STL. Materials are not retained in STL.',slugs:['glb-viewer','glb-to-stl','stl-viewer']}
];
