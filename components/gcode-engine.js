import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {colorFor} from '../lib/gcode/colors.mjs';
import {movementVisible} from '../lib/gcode/statistics.mjs';
export function createGcodeStudio(host,{onLost=()=>{},onSelect=()=>{}}={}){
 const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.domElement.setAttribute('aria-label','3D toolpath. Drag to orbit; scroll to zoom; double-click a path to inspect.');renderer.domElement.tabIndex=0;host.appendChild(renderer.domElement);
 const scene=new T.Scene(),perspective=new T.PerspectiveCamera(45,1,.01,1000000),orthographic=new T.OrthographicCamera(-100,100,100,-100,.01,1000000);
 let camera=perspective,controls,frame=0,active=true,disposed=false,data=null,settings=null,geometry=null,lines=null,dots=null,lastColor='',plate=new T.Group(),width=1,height=1,span=100;
 scene.add(plate);for(const c of [perspective,orthographic]){c.up.set(0,0,1);c.position.set(150,-150,150);}
 const uniforms={lo:{value:0},hi:{value:1e9},enabled:{value:[1,1,1,1,1,1]},pointMode:{value:0}};
 const vertexShader=`attribute float layerId;attribute float kind;varying float showPath;varying vec3 pathColor;uniform float lo;uniform float hi;uniform float enabled[6];void main(){int k=int(kind+.5);showPath=(layerId>=lo&&layerId<=hi)?enabled[k]:0.;pathColor=color;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=6.;}`;
 const fragmentShader=`varying float showPath;varying vec3 pathColor;uniform float pointMode;void main(){if(showPath<.5)discard;if(pointMode>.5&&distance(gl_PointCoord,vec2(.5))>.5)discard;gl_FragColor=vec4(pathColor,1.);}`;
 const material=new T.ShaderMaterial({vertexShader,fragmentShader,vertexColors:true,uniforms});
 const dotMaterial=new T.ShaderMaterial({vertexShader:vertexShader.replace('gl_PointSize=6.;','showPath*=((kind>1.5&&kind<3.5)?1.:0.);gl_PointSize=6.;'),fragmentShader,vertexColors:true,uniforms:{...uniforms,pointMode:{value:1}}});
 const indicator=new T.Mesh(new T.SphereGeometry(.7,12,8),new T.MeshBasicMaterial({color:'#ffffff',depthTest:false}));indicator.renderOrder=5;indicator.visible=false;scene.add(indicator);
 function invalidate(){if(!frame&&!disposed&&active&&!document.hidden)frame=requestAnimationFrame(()=>{frame=0;renderer.render(scene,camera);});}
 function attachControls(){controls?.dispose();controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.screenSpacePanning=true;controls.addEventListener('change',invalidate);}
 attachControls();
 function size(){width=Math.max(1,host.clientWidth);height=Math.max(1,host.clientHeight);renderer.setSize(width,height,false);perspective.aspect=width/height;perspective.updateProjectionMatrix();orthographic.left=-span*width/height;orthographic.right=span*width/height;orthographic.top=span;orthographic.bottom=-span;orthographic.updateProjectionMatrix();invalidate();}
 function theme(){scene.background=new T.Color(getComputedStyle(host).getPropertyValue('--bg').trim()||'#0b0f19');if(settings)buildPlate();invalidate();}
 function clearPlate(){for(const obj of [...plate.children]){obj.geometry?.dispose();obj.material?.dispose();plate.remove(obj);}}
 function buildPlate(){clearPlate();const s=settings,w=s.width,d=s.shape==='circle'?w:s.depth,ox=s.origin==='center'?-w/2:0,oy=s.origin==='center'?-d/2:0,coords=[];
 const add=(a,b)=>coords.push(...a,...b);
 if(s.grid){const step=Math.max(s.spacing,Math.max(w,d)/200);for(let x=0;x<=w+.001;x+=step){if(s.shape==='circle'){const half=Math.sqrt(Math.max(0,(w/2)**2-(x-w/2)**2));add([ox+x,oy+d/2-half,0],[ox+x,oy+d/2+half,0]);}else add([ox+x,oy,0],[ox+x,oy+d,0]);}for(let y=0;y<=d+.001;y+=step){if(s.shape==='circle'){const half=Math.sqrt(Math.max(0,(w/2)**2-(y-d/2)**2));add([ox+w/2-half,oy+y,0],[ox+w/2+half,oy+y,0]);}else add([ox,oy+y,0],[ox+w,oy+y,0]);}}
 if(s.plate){if(s.shape==='circle'){for(let i=0;i<128;i++){const a=i*Math.PI/64,b=(i+1)*Math.PI/64;add([ox+w/2+Math.cos(a)*w/2,oy+d/2+Math.sin(a)*w/2,0],[ox+w/2+Math.cos(b)*w/2,oy+d/2+Math.sin(b)*w/2,0]);}}else{const pts=[[ox,oy,0],[ox+w,oy,0],[ox+w,oy+d,0],[ox,oy+d,0]];for(let i=0;i<4;i++)add(pts[i],pts[(i+1)%4]);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(coords,3));plate.add(new T.LineSegments(g,new T.LineBasicMaterial({color:getComputedStyle(host).getPropertyValue('--border').trim()||'#263247'})));
 if(s.axes)plate.add(new T.AxesHelper(Math.min(w,d)/4));
 }
 function fit(preset=settings?.camera||'isometric'){
  if(!data)return;const b=data.printBounds||data.bounds,center=new T.Vector3(...b.min).add(new T.Vector3(...b.max)).multiplyScalar(.5),radius=Math.max(2,Math.hypot(...b.size)/2);
  const directions={isometric:[1,-1,.85],top:[0,0,1],bottom:[0,0,-1],front:[0,-1,0],back:[0,1,0],left:[-1,0,0],right:[1,0,0]};
  camera.up.set(0,preset==='top'||preset==='bottom'?1:0,preset==='top'||preset==='bottom'?0:1);
  camera.position.copy(center).add(new T.Vector3(...(directions[preset]||directions.isometric)).normalize().multiplyScalar(radius*3/Math.min(1,width/height)));
  controls.target.copy(center);span=radius*1.25/Math.min(1,width/height);orthographic.zoom=1;size();controls.update();invalidate();
 }
 function load(next){
  if(geometry){scene.remove(lines,dots);geometry.dispose();}data=next;lastColor='';geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(data.positions,3));
  const layer=new Float32Array(data.count*2),type=new Float32Array(data.count*2);for(let i=0;i<data.count;i++){layer[i*2]=layer[i*2+1]=data.layerIds[i];type[i*2]=type[i*2+1]=data.types[i];}
  geometry.setAttribute('layerId',new T.BufferAttribute(layer,1));geometry.setAttribute('kind',new T.BufferAttribute(type,1));geometry.setAttribute('color',new T.BufferAttribute(new Float32Array(data.count*6),3));
  lines=new T.LineSegments(geometry,material);dots=new T.Points(geometry,dotMaterial);scene.add(lines,dots);
 }
 function update(next,s){
  const fresh=data!==next,old=settings;if(fresh)load(next);
  settings=s;controls.enableRotate=s.touch||!matchMedia('(pointer:coarse)').matches;controls.enablePan=s.touch||!matchMedia('(pointer:coarse)').matches;controls.enableZoom=s.touch||!matchMedia('(pointer:coarse)').matches;renderer.domElement.style.touchAction=s.touch?'none':'pan-y';
  if(camera!==(s.projection==='orthographic'?orthographic:perspective)){camera=s.projection==='orthographic'?orthographic:perspective;attachControls();fit();}
  if(lastColor!==s.color){const attr=geometry.getAttribute('color'),color=new T.Color();for(let i=0;i<data.count;i++){color.setStyle(colorFor(data,i,s.color));for(let j=0;j<2;j++)attr.setXYZ(i*2+j,color.r,color.g,color.b);}attr.needsUpdate=true;lastColor=s.color;}
  uniforms.lo.value=s.rangeMode==='range'?s.rangeStart:s.rangeMode==='current'?s.layer:0;
  uniforms.hi.value=s.rangeMode==='all'?data.layers.length-1:s.rangeMode==='range'?s.rangeEnd:s.layer;
  uniforms.enabled.value=['extrusion','travel','retraction','unretraction','hop','unknown'].map(k=>s[k]?1:0);geometry.setDrawRange(0,Math.max(0,Math.min(data.count,s.progress))*2);
  const i=Math.max(0,Math.min(data.count-1,s.progress-1));indicator.visible=s.progress>0&&s.progress<data.count&&movementVisible(data,i,s);indicator.position.fromArray(data.positions,i*6+3);
  if(!old||['width','depth','height','shape','origin','grid','plate','axes','spacing'].some(k=>old[k]!==s[k]))buildPlate();
  if(fresh||old?.camera!==s.camera)fit();invalidate();
 }
 const resize=new ResizeObserver(size);resize.observe(host);
 const themes=new MutationObserver(theme);themes.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 const intersection=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)invalidate();});intersection.observe(host);
 const lost=e=>{e.preventDefault();onLost();},visible=()=>invalidate();
 renderer.domElement.addEventListener('webglcontextlost',lost);document.addEventListener('visibilitychange',visible);
 const select=e=>{if(!lines)return;const rect=renderer.domElement.getBoundingClientRect(),ray=new T.Raycaster();ray.params.Line.threshold=Math.max(.3,span/200);ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hits=ray.intersectObject(lines);const hit=hits.find(h=>movementVisible(data,Math.floor(h.index/2),settings));if(hit)onSelect(Math.floor(hit.index/2));};
 renderer.domElement.addEventListener('dblclick',select);theme();size();
 return {update,fit,screenshot:()=>new Promise((resolve,reject)=>{renderer.render(scene,camera);renderer.domElement.toBlob(blob=>blob?resolve(blob):reject(Error('Could not capture this canvas.')),'image/png');}),dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();themes.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visible);renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.domElement.removeEventListener('dblclick',select);controls.dispose();geometry?.dispose();material.dispose();dotMaterial.dispose();indicator.geometry.dispose();indicator.material.dispose();clearPlate();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
}
