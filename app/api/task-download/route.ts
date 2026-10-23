import {env} from 'cloudflare:workers';
import {identity,db,member,allowedNote,str,error,failure} from '../../task-service';
import {zipStream,type ZipEntry} from '../../zip-stream';
export async function GET(req:Request){try{
 const u=await identity(),url=new URL(req.url),team=str(url.searchParams.get('team'),80),note=str(url.searchParams.get('note'),80),purpose=url.searchParams.get('purpose')==='material'?'material':'result',m=await member(team,u.userId),task=await allowedNote(note,team,m,u.userId);
 const rows=await db().prepare('SELECT name,kind,url,object_key FROM task_deliverables WHERE team=? AND note=? AND purpose=? ORDER BY created,id').bind(team,note,purpose).all<any>();if(!rows.results.length)throw error('暂时没有可下载的资料',404);
 const entries:ZipEntry[]=[];for(const item of rows.results.filter(x=>x.kind==='file')){if(!env.BUCKET||!await env.BUCKET.head(item.object_key))throw error('文件“'+item.name+'”暂时不可用，请重试',404);entries.push({name:item.name,open:async()=>{const object=await env.BUCKET!.get(item.object_key);if(!object)throw Error('文件暂不可用');return object.body;}});}
 const links=rows.results.filter(x=>x.kind==='link');if(links.length){const bytes=new TextEncoder().encode(links.map(x=>x.name+'\r\n'+x.url).join('\r\n\r\n'));entries.push({name:'参考链接.txt',open:async()=>new ReadableStream({start(c){c.enqueue(bytes);c.close();}})});}
 const name=(task.title||'任务')+'-'+(purpose==='material'?'任务资料':'交付成果')+'.zip';return new Response(zipStream(entries),{headers:{'Content-Type':'application/zip','Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(name),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch(e){return failure(e);}}
