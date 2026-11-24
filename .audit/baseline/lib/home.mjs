import {tools,categories} from './catalog.mjs';
export const featuredSlugs=['3d-text-generator','3d-model-viewer','book-cover-mockup-generator','3d-room-planner'];
export const homeCategories=['3D viewers','File converters','Product mockups','3D printing','Creative & developer tools','Home & layout'];
export function filterTools(query='',category='All tools'){const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);return tools.filter(t=>(category==='All tools'||t.category===category)&&terms.every(q=>`${t.name} ${t.description} ${t.category} ${t.slug}`.toLowerCase().includes(q)));}
export const featuredTools=featuredSlugs.map(slug=>tools.find(t=>t.slug===slug));
