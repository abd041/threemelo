// Closed relief panel, coordinates in mm. Grid row zero is the image bottom.
export function lithophaneMesh(gray,cols,rows,o){
 if(!Number.isInteger(cols)||!Number.isInteger(rows)||cols<2||rows<2||cols>180||rows>180||gray.length!==cols*rows)throw Error('Invalid image grid.');
 const {width,height,min,max,curve,invert}=o;
 if(![width,height,min,max,curve].every(Number.isFinite)||width<20||width>250||height<10||height>250||min<.5||max>8||max<=min||curve<0||curve>120)throw Error('Invalid dimensions, thickness or curvature.');
 const a=curve*Math.PI/180,R=curve?width/a:0,vertices=[];
 for(let layer=0;layer<2;layer++)for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
 const g=gray[j*cols+i];if(!Number.isFinite(g)||g<0||g>255)throw Error('Invalid luminance.');
 const t=layer?min+(max-min)*(invert?g/255:1-g/255):0;
 const u=i/(cols-1)-.5,y=(j/(rows-1)-.5)*height;
 vertices.push(curve?[(R+t)*Math.sin(u*a),y,(R+t)*Math.cos(u*a)-R]:[u*width,y,t]);}
 const n=cols*rows, out=[];const tri=(a,b,c)=>out.push(...vertices[a],...vertices[b],...vertices[c]);const quad=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);};
 for(let j=0;j<rows-1;j++)for(let i=0;i<cols-1;i++){const p=j*cols+i,q=p+1,r=q+cols,s=p+cols;quad(p,s,r,q);quad(p+n,q+n,r+n,s+n);}
 const edge=[];for(let i=0;i<cols;i++)edge.push(i);for(let j=1;j<rows;j++)edge.push(j*cols+cols-1);for(let i=cols-2;i>=0;i--)edge.push((rows-1)*cols+i);for(let j=rows-2;j>0;j--)edge.push(j*cols);
 for(let i=0;i<edge.length;i++){const p=edge[i],q=edge[(i+1)%edge.length];quad(p,q,q+n,p+n);}
 return new Float32Array(out);
}
