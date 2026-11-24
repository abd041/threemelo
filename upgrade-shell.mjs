import fs from 'node:fs';
import {tools} from './lib/catalog.mjs';
let layout=fs.readFileSync('app/layout.jsx','utf8');
layout=layout.replace("import Script from 'next/script';",`import Script from 'next/script';
import SiteHeader from '../components/SiteHeader.jsx';
import Brand from '../components/Brand.jsx';
import {homeCategories,categoryId} from '../lib/home.mjs';`);
layout=layout.replace('<html lang="en">','<html lang="en" suppressHydrationWarning>');
layout=layout.replace('<body>',`<body><script dangerouslySetInnerHTML={{__html: \`try{document.documentElement.dataset.theme=localStorage.getItem('tm-theme')==='light'?'light':'dark'}catch{document.documentElement.dataset.theme='dark'}\`}} />`);
layout=layout.replace(/        <header className="nav">[\s\S]*?<\/header>/,'        <SiteHeader/>');
layout=layout.replace(/        <footer>[\s\S]*?<\/footer>/,`        <footer className="studio-footer"><div><a href="/" aria-label="ThreeMelo home"><Brand/></a><p>A little less setup.<br/>A lot more possibility.</p><p>Free 3D tools, built for your browser.</p></div><nav aria-label="Tool categories"><h2>Explore</h2>{homeCategories.map(c=><a key={c} href={\`/tools/#\${categoryId(c)}\`}>{c}</a>)}</nav><nav aria-label="Selected tools"><h2>Start creating</h2><a href="/3d-model-viewer/">3D Model Viewer</a><a href="/3d-text-generator/">3D Text Generator</a><a href="/3d-floor-plan-generator/">Floor Plan Generator</a><a href="/stl-viewer/">STL Viewer</a></nav><nav aria-label="Company and policies"><h2>ThreeMelo</h2><a href="/about/">About</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy Policy</a><a href="/terms/">Terms of Use</a><CookieSettingsButton/></nav><div className="footer-bottom"><span>Made for curious minds and creative work.</span><a href={\`mailto:\${SUPPORT_EMAIL}\`}>{SUPPORT_EMAIL}</a></div></footer>`);
layout=layout.replace("icon: [{url: '/icon.png', sizes: '512x512', type: 'image/png'}]","icon: [{url: '/brand-mark.svg', type: 'image/svg+xml'}]");
layout=layout.replace("logo: 'https://threemelo.com/logo.png'","logo: 'https://threemelo.com/brand-mark.svg'");
fs.writeFileSync('app/layout.jsx',layout);
for(const t of tools){const p=`app/${t.slug}/page.jsx`;let s=fs.readFileSync(p,'utf8');s=`import RelatedTools, {ToolContext} from '../../components/RelatedTools.jsx';\n`+s;s=s.replace('</h1>',`</h1><ToolContext slug="${t.slug}"/>`);s=s.replace('</article>',`</article><RelatedTools slug="${t.slug}"/>`);fs.writeFileSync(p,s);}
let privacy=fs.readFileSync('app/privacy/page.jsx','utf8').replace('<h2>Accounts and contact</h2>',`<h2>Local preferences</h2><p>Theme choice, favorite tools and up to six recently opened tools are stored on your device using tm-theme, tm-favorites and tm-recent. They contain tool identifiers, not uploaded files or search queries. Clear this site's browser data to remove them. If storage is blocked, preferences may last only for the current page.</p><h2>Accounts and contact</h2>`);fs.writeFileSync('app/privacy/page.jsx',privacy);
