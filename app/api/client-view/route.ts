import {db,str,json,error,failure,hash} from '../../task-service';
import {livePortal,unlocked,grantValue,cookieName,readPortal,publicContent,portalFile} from '../../client-portal-service';
export async function GET(req:Request){try{
 const q=new URL(req.url).searchParams,row=await livePortal(str(q.get('token'),80));
 if(!await unlocked(req,row))return json({locked:true},403);
 const content=readPortal(row.published),id=q.get('file');
 if(id!==null){if(!/^\d{1,3}$/.test(id)||!content.items[Number(id)])throw error('文件不存在',404);const download=q.get('download')==='1';if(download&&!content.download)throw error('此看板未开放下载',403);return await portalFile(content.items[Number(id)],download);}
 return json({content:publicContent(content),publishedAt:row.published_at,expires:row.expires});
 }catch(e){return failure(e);}}
export async function POST(req:Request){try{
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)throw error('来源不正确',403);
 if(Number(req.headers.get('content-length')||0)>2000)throw error('输入过长');
 const p:any=await req.json(),row=await livePortal(str(p.token,80));
 if(!row.code_hash)return json({ok:true});
 const now=Date.now(),bucket=Math.floor(now/900000),ip=req.headers.get('cf-connecting-ip')||'local',key=await hash(row.token+':'+ip+':'+bucket),d=db();
 await d.prepare('DELETE FROM portal_attempts WHERE expires<?').bind(now).run();
 const attempt=await d.prepare('INSERT INTO portal_attempts (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+900000).first<any>();
 if(attempt.count>10)throw error('尝试次数过多，请15分钟后再试',429);
 if(await hash(row.token+':'+str(p.code,80))!==row.code_hash)throw error('访问码不正确',403);
 const seconds=Math.max(1,Math.min(86400,row.expires?Math.floor((row.expires-now)/1000):86400));
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store','Set-Cookie':cookieName(row.token)+'='+await grantValue(row)+'; HttpOnly; SameSite=Strict; Path=/; Max-Age='+seconds+(new URL(req.url).protocol==='https:'?'; Secure':'')}});
 }catch(e){return failure(e);}}
