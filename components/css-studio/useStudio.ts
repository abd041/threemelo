'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {defaultConfig,validateConfig} from '../../lib/css-studio/model.ts';
import type {Config} from '../../lib/css-studio/model.ts';
import {commit,undo,redo} from '../../lib/css-studio/history.ts';
import type {History} from '../../lib/css-studio/history.ts';
export function useStudio(){
  const [history,setHistory]=useState<History>(()=>({past:[],present:defaultConfig(),future:[]}));
  const ref=useRef(history),group=useRef<History|null>(null);
  const publish=useCallback((h:History)=>{ref.current=h;setHistory(h);},[]);
  const begin=useCallback(()=>{if(!group.current)group.current=ref.current;},[]);
  const end=useCallback(()=>{if(group.current){const base=group.current;group.current=null;publish(commit(base,ref.current.present));}},[publish]);
  const change=useCallback((update:Config|((c:Config)=>Config))=>{const next=validateConfig(typeof update==='function'?update(ref.current.present):update);publish(group.current?{...ref.current,present:next}:commit(ref.current,next));},[publish]);
  const goUndo=useCallback(()=>{end();publish(undo(ref.current));},[end,publish]);
  const goRedo=useCallback(()=>{end();publish(redo(ref.current));},[end,publish]);
  useEffect(()=>{const handler=(e:KeyboardEvent)=>{const target=e.target as HTMLElement;if(target.closest('input,textarea,select,[contenteditable=true]'))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)goRedo();else goUndo();}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[goUndo,goRedo]);
  return {config:history.present,ref,change,begin,end,undo:goUndo,redo:goRedo,canUndo:history.past.length>0,canRedo:history.future.length>0};
}
