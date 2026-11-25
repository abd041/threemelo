import {track,trackDownload} from '../analytics.mjs';
export function event(name,detail){track('gcode_'+name,{tool:'gcode-viewer',...(detail?{detail}:{})});}
export function download(blob,extension){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='threemelo-gcode.'+extension;document.body.append(a);trackDownload(a.download);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);event('export',extension);}
export async function copyText(text){if(!navigator.clipboard?.writeText)throw Error('Clipboard access is unavailable. Use a downloaded report instead.');await navigator.clipboard.writeText(text);}
