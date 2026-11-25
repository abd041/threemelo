import {createElement} from 'react';
import type {Config} from '../../lib/css-studio/model.ts';
import {defaultConfig,shapes} from '../../lib/css-studio/model.ts';
import {objectNodes} from '../../lib/css-studio/geometry.ts';
import type {ObjectNode} from '../../lib/css-studio/geometry.ts';
import {scopedGeometry} from './Preview';
function thumbConfig(shape:Config['object']['shape']) {const c=defaultConfig();c.object={...c.object,shape,width:shape==='cube'?64:90,height:shape==='book'?90:64,depth:shape==='cube'?64:shape==='text'?8:24,radius:shape==='cube'?0:4,labels:false,text:shape==='text'?'3D':''};return c;}
function render(nodes:ObjectNode[]):React.ReactNode{return nodes.map((n,i)=>createElement(n.tag,{key:i,className:n.className},n.text,n.children?render(n.children):null));}
const thumbnailCSS=shapes.map(shape=>scopedGeometry(thumbConfig(shape),`.cs-mini[data-kind="${shape}"]`)).join('\n');
export function ThumbnailStyles(){return <style>{thumbnailCSS}</style>;}
export default function Thumbnail({config:c,large=false}:{config:Config;large?:boolean}) {const t=thumbConfig(c.object.shape);return <div className={`cs-mini ${large?'cs-mini-large':''}`} data-kind={c.object.shape} aria-hidden="true"><div className="tm-object" data-shape={t.object.shape} style={{transform:`scale(${large?1:.55}) rotateX(${c.pose.rx}deg) rotateY(${c.pose.ry}deg) rotateZ(${c.pose.rz}deg) skew(${c.pose.kx}deg,${c.pose.ky}deg)`,transformStyle:'preserve-3d'}}>{render(objectNodes(t))}</div></div>;}
