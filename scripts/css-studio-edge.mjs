import {chromium,expect} from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const origin=process.env.CSS_URL||'http://127.0.0.1:4182';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Users/HP/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'});
const report={checks:[],errors:[],unrelated:[]};
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror',e=>report.errors.push(e.message));
const button=name=>page.getByRole('button',{name,exact:true});
async function check(name,fn){await fn();report.checks.push(name);console.log('PASS',name);}
try {
  await page.goto(origin+'/3d-css-transform-generator/');await page.locator('.cs-studio[data-ready=true]').waitFor();
  await page.getByRole('button',{name:'Reject non-essential',exact:true}).click();
  await check('Theme toggle preserves configuration',async()=>{await page.getByLabel('Rotate X',{exact:true}).fill('48');await page.getByLabel('Rotate X',{exact:true}).press('Tab');await button('Switch to light theme').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');assert.equal(await page.getByLabel('Rotate X',{exact:true}).inputValue(),'48');await button('Switch to dark theme').click();});
  await check('Rapid preset changes end in the selected valid preset',async()=>{for(const index of [1,4,6,2,0,9,15])await page.locator('.cs-preset-grid button').nth(index).click();assert.equal(await page.getByLabel('Object',{exact:true}).inputValue(),'text');await button('Undo').click();assert.equal(await page.getByLabel('Object',{exact:true}).inputValue(),'layers');await button('Reset all').click();});
  await check('Clipboard and share failures provide manual recovery',async()=>{await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('Denied');}},configurable:true});document.execCommand=()=>false;});await button('Copy code').click();await expect(page.locator('.cs-status')).toContainText('copy it manually');await button('Share').click();await expect(page.locator('.cs-status')).toContainText('address bar');assert.match(page.url(),/#tm1=/);});
  await check('Disabled storage, unsupported fullscreen and download failure retain state',async()=>{await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('Storage unavailable.');};HTMLElement.prototype.requestFullscreen=undefined;URL.createObjectURL=()=>{throw new Error('Download unavailable.');};});await button('Save').click();await expect(page.locator('.cs-status')).toContainText('Storage unavailable');await button('Fullscreen').click();await expect(page.locator('.cs-status')).toContainText('Fullscreen is unavailable');await button('Download').click();await expect(page.locator('.cs-status')).toContainText('Copy the generated code instead');assert.equal(await page.getByLabel('Rotate X',{exact:true}).inputValue(),'25');});
  await check('Malformed shared URL falls back safely without hydration errors',async()=>{await page.goto(origin+'/3d-css-transform-generator/#tm1=broken');await page.locator('.cs-studio[data-ready=true]').waitFor();await expect(page.locator('.cs-status')).toContainText('invalid configuration');assert.equal(await page.getByLabel('Rotate X',{exact:true}).inputValue(),'25');});
  await check('Mobile Settings and Code panes fit at 320px',async()=>{await page.setViewportSize({width:320,height:800});for(const tab of ['Settings','Code','Preview']){await page.getByRole('tab',{name:tab,exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}await page.setViewportSize({width:800,height:320});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);});
  await page.setViewportSize({width:1440,height:1000});
  for(const path of ['/','/tools/','/3d-text-generator/','/3d-logo-generator/','/3d-model-viewer/','/3d-graphing-calculator/']){const response=await page.goto(origin+path);assert.equal(response.status(),200);assert.equal(await page.locator('h1').count(),1);await page.waitForTimeout(300);report.unrelated.push({path,status:200});}
  assert.equal(report.errors.length,0);
}finally{fs.writeFileSync('.audit/css-studio/edge.json',JSON.stringify(report,null,2));await browser.close();}
