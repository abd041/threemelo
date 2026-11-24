export const faces=['right','left','top','bottom','front','back'];
export const presets={Cube:[10,10,10],Product:[8,15,5],Shipping:[30,20,24],Cosmetic:[5,14,5],Cereal:[19,28,7]};
export const boxDefaults={width:8,height:15,depth:5,finish:'matte',color:'#e4d7c5',background:'#171824',light:3,shadow:true,transparent:false,spin:false};
export function boxDimensions(s){const a=[s.width,s.height,s.depth];if(a.some(v=>!Number.isFinite(v)||v<1||v>100))throw Error('Dimensions must be between 1 and 100 cm.');const scale=3/Math.max(...a);return a.map(v=>v*scale);}
export function faceRatio(side,s){const [w,h,d]=boxDimensions(s);if(!faces.includes(side))throw Error('Unknown face');return side==='right'||side==='left'?d/h:side==='top'||side==='bottom'?w/d:w/h;}
export const finishes={matte:.8,glossy:.22,kraft:.96};
