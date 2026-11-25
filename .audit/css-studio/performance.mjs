import fs from 'node:fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
const chromePath='C:/Users/HP/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe';
const chrome=await chromeLauncher.launch({chromePath,chromeFlags:['--headless','--no-sandbox']});
try{const r=await lighthouse('http://127.0.0.1:4182/3d-css-transform-generator/',{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']});fs.writeFileSync('.audit/css-studio/lighthouse-after.json',r.report);console.log(JSON.stringify({scores:Object.fromEntries(Object.entries(r.lhr.categories).map(([k,v])=>[k,v.score*100])),LCP:r.lhr.audits['largest-contentful-paint'].displayValue,CLS:r.lhr.audits['cumulative-layout-shift'].displayValue,TBT:r.lhr.audits['total-blocking-time'].displayValue}));}finally{await chrome.kill();}
process.exit(0);
