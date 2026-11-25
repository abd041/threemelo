import fs from 'node:fs';
import {makeTemplate} from '../lib/floor/templates.ts';
import {blueprintSVG} from '../lib/floor/blueprint.ts';
fs.mkdirSync('public/floor-plans',{recursive:true});
for(const [index,name] of [[0,'studio-apartment'],[2,'two-bedroom-apartment'],[3,'three-bedroom-house'],[6,'open-plan-living']]){let svg=blueprintSVG(makeTemplate(index),{width:600});svg=svg.replace(/height="\d+"/,'height="420"');fs.writeFileSync(`public/floor-plans/${name}.svg`,svg);}
