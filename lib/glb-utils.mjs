export function validateGLB(buffer){
 if(!(buffer instanceof ArrayBuffer)||buffer.byteLength<20||buffer.byteLength>50*1024*1024)throw Error('GLB must be between 20 bytes and 50 MB.');
 const v=new DataView(buffer);if(v.getUint32(0,true)!==0x46546c67||v.getUint32(4,true)!==2||v.getUint32(8,true)!==buffer.byteLength)throw Error('Invalid GLB 2.0 header.');
 let offset=12,json=null,bin=false;while(offset<buffer.byteLength){if(offset+8>buffer.byteLength)throw Error('Truncated GLB chunk.');const len=v.getUint32(offset,true),type=v.getUint32(offset+4,true);if(len%4||offset+8+len>buffer.byteLength)throw Error('Invalid GLB chunk length.');if(offset===12&&type!==0x4e4f534a)throw Error('GLB JSON chunk must be first.');if(type===0x4e4f534a){if(json)throw Error('Duplicate JSON chunk.');json=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(new Uint8Array(buffer,offset+8,len)));}if(type===0x004e4942){if(bin)throw Error('Duplicate binary chunk.');bin=true;}offset+=8+len;}
 if(!json||json.asset?.version!=='2.0')throw Error('Expected glTF 2.0 data.');
 for(const item of [...(json.buffers||[]),...(json.images||[])])if(item.uri&&!/^data:/i.test(item.uri))throw Error('External assets are not supported. Use a self-contained GLB.');
 const unsupported=['KHR_draco_mesh_compression','EXT_meshopt_compression','KHR_texture_basisu'];if((json.extensionsUsed||[]).some(x=>unsupported.includes(x)))throw Error('Compressed GLB assets are not supported. Export an uncompressed GLB.');
 if(json.skins?.length||(json.meshes||[]).some(m=>m.primitives?.some(p=>p.targets?.length||![undefined,4].includes(p.mode))))throw Error('Only static triangle meshes are supported (no skinning, morph targets, lines or points).');
 return {animations:json.animations?.length||0};
}
