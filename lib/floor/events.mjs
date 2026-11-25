import {track} from '../analytics.mjs';
const events={start:'tool_open',template:'preset_selected',room:'tool_interaction',view:'tool_interaction',save:'tool_interaction',export:'tool_interaction',error:'tool_error'};
// Never include project IDs, object names, coordinates, filenames or file data.
export function floorEvent(action){if(events[action])track(events[action],{tool:'3d-floor-plan-generator'});}
