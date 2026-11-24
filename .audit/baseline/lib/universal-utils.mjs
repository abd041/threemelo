export function selectModel(files){
 const roots=files.filter(f=>/\.(stl|obj|glb|gltf|fbx)$/i.test(f.name));
 if(roots.length!==1)throw Error('Select exactly one STL, OBJ, GLB, GLTF or FBX model.');
 if(files.reduce((n,f)=>n+f.size,0)>50*1024*1024)throw Error('Maximum combined size is 50 MB.');
 const root=roots[0],format=root.name.split('.').pop().toLowerCase();
 const allowed={stl:/^$/,glb:/^$/,obj:/\.(mtl|png|jpe?g|webp|bmp)$/i,gltf:/\.(bin|png|jpe?g|webp)$/i,fbx:/\.(png|jpe?g|webp)$/i}[format];
 const names=new Set();for(const f of files){if(f!==root&&!allowed.test(f.name))throw Error('Unsupported companion file: '+f.name);const key=f.name.toLowerCase();if(names.has(key))throw Error('Duplicate filename: '+f.name);names.add(key);}
 if(files.filter(f=>/\.mtl$/i.test(f.name)).length>1)throw Error('Select at most one MTL file.');
 return {root,format};
}
