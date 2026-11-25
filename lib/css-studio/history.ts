import type {Config} from './model.ts';
export interface History {past:Config[];present:Config;future:Config[];}
export function commit(h:History,next:Config):History {if(JSON.stringify(h.present)===JSON.stringify(next))return h;return {past:[...h.past,h.present].slice(-80),present:next,future:[]};}
export function undo(h:History):History {return h.past.length?{past:h.past.slice(0,-1),present:h.past.at(-1)!,future:[h.present,...h.future]}:h;}
export function redo(h:History):History {return h.future.length?{past:[...h.past,h.present],present:h.future[0],future:h.future.slice(1)}:h;}
