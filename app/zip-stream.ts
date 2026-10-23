const encoder=new TextEncoder();
const table=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function block(size:number,values:[number,number,number][]){const bytes=new Uint8Array(size),v=new DataView(bytes.buffer);for(const [at,width,value] of values){if(width===2)v.setUint16(at,value,true);else v.setUint32(at,value,true);}return bytes;}
export type ZipEntry={name:string;open:()=>Promise<ReadableStream<Uint8Array>>};
export function zipStream(entries:ZipEntry[]){
 async function* generate(){let offset=0;const directory:Uint8Array[]=[];for(let index=0;index<entries.length;index++){
  const entry=entries[index],name=encoder.encode(String(index+1).padStart(2,'0')+'_'+entry.name.replace(/[\\/\x00-\x1f:*?"<>|]/g,'_').slice(0,180)),start=offset;let crc=0xffffffff,size=0;
  const header=block(30,[[0,4,0x04034b50],[4,2,20],[6,2,0x808],[12,2,33],[26,2,name.length]]);yield header;yield name;offset+=header.length+name.length;
  const reader=(await entry.open()).getReader();try{while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;for(const b of chunk.value)crc=table[(crc^b)&255]^(crc>>>8);offset+=chunk.value.length;yield chunk.value;}}finally{await reader.cancel();reader.releaseLock();}
  crc=(crc^0xffffffff)>>>0;const descriptor=block(16,[[0,4,0x08074b50],[4,4,crc],[8,4,size],[12,4,size]]);yield descriptor;offset+=16;
  directory.push(block(46,[[0,4,0x02014b50],[4,2,20],[6,2,20],[8,2,0x808],[14,2,33],[16,4,crc],[20,4,size],[24,4,size],[28,2,name.length],[42,4,start]]),name);
 }const centralStart=offset;for(const part of directory){yield part;offset+=part.length;}yield block(22,[[0,4,0x06054b50],[8,2,entries.length],[10,2,entries.length],[12,4,offset-centralStart],[16,4,centralStart]]);
 }
 const iterator=generate();return new ReadableStream<Uint8Array>({async pull(controller){try{const next=await iterator.next();if(next.done)controller.close();else controller.enqueue(next.value);}catch(e){controller.error(e);}},async cancel(){await iterator.return(undefined);}});
}
