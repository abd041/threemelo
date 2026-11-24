import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'node:fs';
const chromePath=process.env.CHROME_PATH||'C:/Users/HP/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe';
for(const [label,url] of [['before','http://localhost:4174/'],['after','http://localhost:4173/']]){const chrome=await chromeLauncher.launch({chromePath,chromeFlags:['--headless','--no-sandbox','--enable-unsafe-swiftshader']});try{const result=await lighthouse(url,{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']});fs.writeFileSync(`lighthouse-${label}.json`,result.report);const r=result.lhr;console.log(label,JSON.stringify({scores:Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k,v.score*100])),lcp:r.audits['largest-contentful-paint'].displayValue,cls:r.audits['cumulative-layout-shift'].displayValue,tbt:r.audits['total-blocking-time'].displayValue}));}finally{await chrome.kill();}}
process.exit(0);
