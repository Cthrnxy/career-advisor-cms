// Port of the original desktop app's light-background removal, with transparent edge trimming.
export function processSignature(image,removeBackground){
 const {width,height,data}=image;const out=new Uint8ClampedArray(data);let left=width,top=height,right=-1,bottom=-1;
 const edge=[],step=Math.max(1,Math.floor(Math.min(width,height)/40));
 const add=(x,y)=>{const i=(y*width+x)*4;if(data[i+3]>240)edge.push([data[i],data[i+1],data[i+2]])};
 for(let x=0;x<width;x+=step){add(x,0);add(x,height-1)}for(let y=0;y<height;y+=step){add(0,y);add(width-1,y)}
 const bg=[0,1,2].map(c=>{const a=edge.map(p=>p[c]).sort((a,b)=>a-b);return a.length?a[Math.floor(a.length/2)]:255});
 if(removeBackground&&Math.min(...bg)<175)throw new Error('The background is too dark to remove automatically. Disable background removal or choose a lighter source.');
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;if(removeBackground&&data[i+3]){const difference=Math.max(...bg.map((v,c)=>v-data[i+c]));if(difference<=14)out[i+3]=0;else{const a=Math.min(255,Math.round(255*(difference-14)/Math.max(1,Math.max(...bg)-14)));out[i+3]=Math.round(a*data[i+3]/255);for(let c=0;c<3;c++)out[i+c]=a?Math.max(0,Math.min(255,Math.round((data[i+c]-(1-a/255)*bg[c])/(a/255)))):0}}if(out[i+3]){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}}
 if(right<0)throw new Error('No visible signature ink was found.');
 const pad=Math.max(3,Math.min(24,Math.round(Math.min(width,height)*.04)));
 return {data:out,width,height,bounds:removeBackground?{x:Math.max(0,left-pad),y:Math.max(0,top-pad),width:Math.min(width-1,right+pad)-Math.max(0,left-pad)+1,height:Math.min(height-1,bottom+pad)-Math.max(0,top-pad)+1}:{x:0,y:0,width,height}};
}
