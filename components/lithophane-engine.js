import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {STLExporter} from 'three/addons/exporters/STLExporter.js';
import {lithophaneMesh} from '../lib/lithophane.mjs';
export function createLithophaneStudio(host){
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));host.appendChild(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color('#171824');const camera=new T.PerspectiveCamera(40,1,.1,5000),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
 const material=new T.MeshStandardMaterial({color:0xfff3d6,roughness:.8});const light=new T.DirectionalLight(0xffffff,3);light.position.set(100,200,300);scene.add(light,new T.HemisphereLight(0xffffff,0x555577,1.5));let mesh,frame,disposed=false;
 function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function fit(){if(!mesh)return;const box=new T.Box3().setFromObject(mesh),c=box.getCenter(new T.Vector3()),s=box.getSize(new T.Vector3());const d=Math.max(s.y,s.x/camera.aspect,s.z)*1.8;controls.target.copy(c);camera.position.copy(c).add(new T.Vector3(.2,.15,1).normalize().multiplyScalar(d));controls.update();}
 function update(gray,cols,rows,o){const p=lithophaneMesh(gray,cols,rows,o),g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.computeVertexNormals();if(mesh){scene.remove(mesh);mesh.geometry.dispose();}mesh=new T.Mesh(g,material);scene.add(mesh);fit();return p.length/9;}
 function tick(){if(disposed)return;if(host.getBoundingClientRect().bottom>0 && host.getBoundingClientRect().top<window.innerHeight){controls.update();renderer.render(scene,camera);}frame=requestAnimationFrame(tick);}tick();
 return {update,fit,wire(v){material.wireframe=v;},exportFile(binary){if(!mesh)throw Error('No model.');mesh.updateMatrixWorld(true);return new Blob([new STLExporter().parse(mesh,{binary})],{type:'model/stl'});},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();mesh?.geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();}};
}
