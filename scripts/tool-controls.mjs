import {chromium} from '@playwright/test';
import fs from 'node:fs';
import {tools} from '../lib/catalog.mjs';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Users/HP/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});const context=await browser.newContext({viewport:{width:1200,height:900}});await context.addInitScript(()=>localStorage.setItem('threemelo-consent',JSON.stringify({analytics:false})));const page=await context.newPage();let all=[];
for(const t of tools){await page.goto('http://localhost:4173'+t.canonicalPath);await page.waitForTimeout(700);console.log(t.slug,JSON.stringify(await page.locator('main button').allTextContents()));}
await browser.close();
