import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export function createHero(host,{paused,onError}){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(4,2.8,5.5);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.minDistance=3;controls.maxDistance=10;controls.target.set(0,.3,0);
 const geometry=new THREE.TorusKnotGeometry(1,.32,128,20,2,3),material=new THREE.MeshStandardMaterial({color:0x9c74ed,metalness:.5,roughness:.3});const mesh=new THREE.Mesh(geometry,material);mesh.position.y=.45;scene.add(mesh);
 const grid=new THREE.GridHelper(16,32,0x4b4668,0x293044);grid.position.y=-1.2;scene.add(grid);
 scene.add(new THREE.HemisphereLight(0xe5ddff,0x354064,3));const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(3,5,4);scene.add(light);const rim=new THREE.DirectionalLight(0x22d3ee,3);rim.position.set(-4,2,-3);scene.add(rim);
 let visible=true,frame=0,dead=false,last=0;
 function render(){if(dead||!visible||document.hidden)return;renderer.render(scene,camera);}
 function tick(time){frame=0;if(dead||paused||!visible||document.hidden)return;mesh.rotation.y+=Math.min((time-last)/1000,.05)*.18;last=time;render();frame=requestAnimationFrame(tick);}
 function start(){cancelAnimationFrame(frame);frame=0;render();if(!paused&&visible&&!document.hidden&&!dead){last=performance.now();frame=requestAnimationFrame(tick);}}
 const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();render();});resize.observe(host);
 const changed=()=>render();controls.addEventListener('change',changed);document.addEventListener('visibilitychange',start);
 const lost=e=>{e.preventDefault();paused=true;cancelAnimationFrame(frame);onError();};renderer.domElement.addEventListener('webglcontextlost',lost);
 start();return {pause(value){paused=value;start();},visible(value){visible=value;start();},reset(){camera.position.set(4,2.8,5.5);controls.target.set(0,.3,0);mesh.rotation.set(0,0,0);controls.update();render();},dispose(){dead=true;cancelAnimationFrame(frame);resize.disconnect();document.removeEventListener('visibilitychange',start);controls.removeEventListener('change',changed);renderer.domElement.removeEventListener('webglcontextlost',lost);controls.dispose();geometry.dispose();material.dispose();grid.geometry.dispose();grid.material.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
}
