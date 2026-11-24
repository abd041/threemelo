export function outputScale(unit, multiplier){const base={mm:1000,cm:100,m:1}[unit],n=Number(multiplier);if(!base||!Number.isFinite(n)||n<0.0001||n>10000)throw Error('Choose a valid unit and scale between 0.0001 and 10000.');return base*n;}
export function outputName(name){return (name.replace(/\.glb$/i,'').replace(/[\\/:*?"<>|]/g,'_')||'model')+'.stl';}
