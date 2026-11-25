'use client';
import {useEffect,useRef,useState} from 'react';
import {floorEvent} from '../../lib/floor/events.mjs';
import {history,commit,undo,redo} from '../../lib/floor/history.ts';
import {makeTemplate} from '../../lib/floor/templates.ts';
import {validateProject,deleteObjects,duplicateObjects,moveObjects} from '../../lib/floor/project.ts';
import {loadLibrary,saveProject} from '../../lib/floor/storage.ts';
export function usePlanner(){const [state,setState]=useState(null),[preview,setPreview]=useState(null),[selection,setSelection]=useState([]),[message,setMessage]=useState(''),[saveStatus,setSaveStatus]=useState('Loading local projects…'),[storageReady,setStorageReady]=useState(false);const current=useRef(null),status=useRef(saveStatus);current.current=state;status.current=saveStatus;
  useEffect(()=>{let p=makeTemplate(0);try{const lib=loadLibrary(localStorage);p=lib.projects.find(p=>p.id===lib.active)||lib.projects[0]||p;if(!lib.projects.length){const unit=localStorage.getItem('tm-floor-units');if(['ft-in','ft','in','m','cm'].includes(unit))p.units=unit;}setStorageReady(true);setSaveStatus('Unsaved changes');}catch{setMessage('Browser storage is unavailable or damaged. Your existing data has been preserved. Use JSON backups.');setSaveStatus('Not saved — download a backup');}floorEvent('start');setState(history(p));setSelection(p.rooms[0]?[p.rooms[0].id]:[]);},[]);
  const plan=preview||state?.present;
  function apply(next){try{validateProject(next);setState(h=>commit(h,{...next,updatedAt:new Date().toISOString()}));setPreview(null);setMessage('');setSaveStatus('Unsaved changes');return true;}catch(e){setPreview(null);setMessage(e.message);return false;}}
  function save(){if(!current.current)return false;try{saveProject(localStorage,current.current.present);setSaveStatus('Saved in this browser');floorEvent('save');setStorageReady(true);return true;}catch(e){setSaveStatus('Not saved — download a backup');setMessage(`Save failed: ${e.message}. Download JSON to keep your work.`);return false;}}
  useEffect(()=>{if(!state||!storageReady)return;setSaveStatus('Unsaved changes');const timer=setTimeout(save,700);return()=>clearTimeout(timer);},[state,storageReady]);
  useEffect(()=>{const before=e=>{if(status.current!=='Saved in this browser'){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',before);return()=>window.removeEventListener('beforeunload',before);},[]);
  function remove(){if(plan&&selection.length&&apply(deleteObjects(plan,selection)))setSelection([]);}
  function duplicate(){if(!plan)return;const result=duplicateObjects(plan,selection);if(apply(result.project))setSelection(result.ids);}
  const goBack=()=>{setPreview(null);setState(h=>undo(h));},goForward=()=>{setPreview(null);setState(h=>redo(h));};
  function shortcuts(e){if(e.target.closest('input,textarea,select,[contenteditable=true]')||e.target.closest('dialog'))return;const cmd=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();if(cmd&&['z','y','d','s'].includes(k)){e.preventDefault();if(k==='z')(e.shiftKey?goForward:goBack)();if(k==='y')goForward();if(k==='d')duplicate();if(k==='s')save();}else if(['Delete','Backspace'].includes(e.key)){e.preventDefault();remove();}else if(e.key==='Escape'){setSelection([]);setPreview(null);}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&selection.length){e.preventDefault();const step=(e.shiftKey?10:1)*(plan.preferences.snap?plan.preferences.gridSize:.01);apply(moveObjects(plan,selection,e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0,e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0));}}
  return {plan,state,selection,setSelection,preview,setPreview,apply,save,saveStatus,message,setMessage,remove,duplicate,undo:goBack,redo:goForward,shortcuts};
}
