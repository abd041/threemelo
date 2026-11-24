export const shirtDefaults={color:'#ececf2',background:'#171824',finish:'matte',light:3,transparent:false,spin:false,shadow:true,scale:0.65,x:0,y:0,backScale:0.65,backX:0,backY:0};
export const faces=['front','back'];
export function shirtOutline(){return [[-0.35,1.2],[-0.65,1.27],[-1.05,1.1],[-1.48,.65],[-1.02,.25],[-.76,.52],[-.76,-1.2],[.76,-1.2],[.76,.52],[1.02,.25],[1.48,.65],[1.05,1.1],[.65,1.27],[.35,1.2],[.23,1.04],[0,.98],[-.23,1.04]];}
export function artworkRect(w,h,scale,x,y){if(![w,h,scale,x,y].every(Number.isFinite)||w<=0||h<=0||scale<.1||scale>1||Math.abs(x)>1||Math.abs(y)>1)throw Error('Invalid artwork placement');const ratio=Math.min(1.3/w,1.6/h)*scale;const width=w*ratio,height=h*ratio;return {width,height,x:x*(1.3-width)/2,y:y*(1.6-height)/2-.1};}
