import * as T from 'three';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {STLExporter} from 'three/addons/exporters/STLExporter.js';
import {validateSVG} from '../lib/svg-stl.mjs';
import {outline,cutterMesh} from '../lib/cookie-cutter.mjs';
import {meshMetrics} from '../lib/mesh-metrics.mjs';
export function createCutterStudio(host){
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));host.appendChild(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color('#171824');const camera=new T.PerspectiveCamera(40,1,.1,5000),controls=new OrbitControls(camera,renderer.domElement),group=new T.Group();scene.add(group);controls.enableDamping=true;
 const light=new T.DirectionalLight(0xffffff,3);light.position.set(100,200,300);scene.add(light,new T.HemisphereLight(0xffffff,0x555577,1.5));const material=new T.MeshStandardMaterial({color:0xa78bfa,roughness:.6});let frame,disposed=false;
 function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function clear(){for(const mesh of [...group.children]){mesh.geometry.dispose();group.remove(mesh);}}
 function fit(){const box=new T.Box3().setFromObject(group);if(box.isEmpty())return;const c=box.getCenter(new T.Vector3()),s=box.getSize(new T.Vector3()),v=T.MathUtils.degToRad(camera.fov);const d=Math.max(s.y/(2*Math.tan(v/2)),s.x/(2*Math.tan(v/2)*camera.aspect),s.z)*1.7;controls.target.copy(c);camera.position.copy(c).add(new T.Vector3(.4,.35,1).normalize().multiplyScalar(d));controls.update();}
 function update(kind,svg,opts){let points;if(kind==='custom'){validateSVG(svg);const doc=new DOMParser().parseFromString(svg,'image/svg+xml');if(doc.querySelector('parsererror'))throw Error('Invalid SVG XML.');const shapes=new SVGLoader().parse(svg).paths.filter(p=>p.userData?.style?.fill!=='none').flatMap(p=>SVGLoader.createShapes(p));if(shapes.length!==1||shapes[0].holes.length)throw Error('Use one filled outline without holes.');points=shapes[0].getPoints(24).map(p=>[p.x,-p.y]);}else points=outline(kind);const positions=cutterMesh(points,opts),stats=meshMetrics(positions);if(!stats.closed)throw Error('Generated mesh failed edge validation.');const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.computeVertexNormals();clear();group.add(new T.Mesh(g,material));fit();return stats;}
 function tick(){if(disposed)return;if(host.getBoundingClientRect().bottom>0 && host.getBoundingClientRect().top<window.innerHeight){controls.update();renderer.render(scene,camera);}frame=requestAnimationFrame(tick);}tick();
 return {update,fit,wireframe(v){material.wireframe=v;},exportFile(binary){if(!group.children.length)throw Error('No model to export.');group.updateMatrixWorld(true);return new Blob([new STLExporter().parse(group,{binary})],{type:'model/stl'});},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();clear();material.dispose();renderer.dispose();renderer.domElement.remove();}};
}
