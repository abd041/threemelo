import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import {tools} from '../lib/catalog.mjs';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Users/HP/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
await context.addInitScript(()=>localStorage.setItem('threemelo-consent',JSON.stringify({analytics:false})));
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:4173/');await page.waitForTimeout(1500);
console.log('hero',await page.locator('.scene-controls').innerText());
for(const theme of ['dark','light']){await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();console.log(theme,JSON.stringify(result.violations.map(v=>({id:v.id,description:v.description,nodes:v.nodes.slice(0,4).map(n=>({target:n.target,summary:n.failureSummary}))}))));}
for(const width of [320,375,390,414,768,1024,1440,1920]){await page.setViewportSize({width,height:900});console.log('width',width,await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth})));}
await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'homepage-light.png'});await page.evaluate(()=>document.documentElement.dataset.theme='dark');await page.screenshot({path:'homepage-dark.png'});console.log('errors',errors);await browser.close();
