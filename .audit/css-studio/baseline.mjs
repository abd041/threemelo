import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import {chromium} from '@playwright/test';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
const chromePath='C:/Users/HP/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe';
const browser=await chromium.launch({executablePath:chromePath});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://127.0.0.1:4182/3d-css-transform-generator/');
await page.screenshot({path:'.audit/css-studio/before.png',fullPage:true});
const scripts=await page.locator('script[src]').evaluateAll(xs=>xs.map(x=>new URL(x.src).pathname));
const bytes=scripts.map(p=>{const b=fs.readFileSync('out'+p);return {path:p,bytes:b.length,gzip:gzipSync(b).length};});
fs.writeFileSync('.audit/css-studio/before-bundle.json',JSON.stringify(bytes,null,2));
await browser.close();
const chrome=await chromeLauncher.launch({chromePath,chromeFlags:['--headless','--no-sandbox']});
try{const r=await lighthouse('http://127.0.0.1:4182/3d-css-transform-generator/',{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']});fs.writeFileSync('.audit/css-studio/lighthouse-before.json',r.report);console.log(JSON.stringify(Object.fromEntries(Object.entries(r.lhr.categories).map(([k,v])=>[k,v.score*100]))));}finally{await chrome.kill();}
