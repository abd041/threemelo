import type {Project} from './types.ts';
export type History={past:Project[];present:Project;future:Project[]};
export const history=(present:Project):History=>({past:[],present,future:[]});
export function commit(h:History,present:Project):History {if(JSON.stringify(h.present)===JSON.stringify(present))return h;return {past:[...h.past,h.present].slice(-50),present,future:[]};}
export const undo=(h:History):History=>h.past.length?{past:h.past.slice(0,-1),present:h.past.at(-1)!,future:[h.present,...h.future].slice(0,50)}:h;
export const redo=(h:History):History=>h.future.length?{past:[...h.past,h.present].slice(-50),present:h.future[0],future:h.future.slice(1)}:h;
