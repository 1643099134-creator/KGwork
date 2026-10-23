import {db,error,hash} from './task-service';
import {env} from 'cloudflare:workers';
import {webPreviewPolicy} from './web-preview';
import {officePreview} from './office-preview';
export type PortalItem={key:string;name:string;category:string;caption:string;kind:string;url:string;objectKey:string;mime:string;size:number;stamp:number};
export type PortalContent={title:string;client:string;body:string;color:string;download:boolean;items:PortalItem[]};
export const readPortal=(s:string):PortalContent=>JSON.parse(s);
export const publicItem=({objectKey,stamp,key,...f}:PortalItem,index:number)=>({...f,id:String(index)});
export function publicContent(p:PortalContent){return {...p,items:p.items.map(publicItem)};}
export async function livePortal(token:string){
 if(!/^[a-f0-9]{64}$/.test(token))throw error('资料看板不存在或已停用',404);
 const row=await db().prepare('SELECT * FROM client_portals WHERE token=?').bind(token).first<any>();
 if(!row||!row.published||row.expires&&row.expires<=Date.now())throw error('资料看板不存在、已过期或已停用',404);
 return row;
}
export const cookieName=(token:string)=>'client_'+token.slice(0,20);
export async function grantValue(row:any){return hash('client-access:'+row.token+':'+row.code_hash+':'+row.published_at);}
export async function unlocked(req:Request,row:any){
 if(!row.code_hash)return true;
 const cookie=(req.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName(row.token)+'='))?.split('=')[1];
 return !!cookie&&cookie===await grantValue(row);
}
export const canPreview=(f:{kind:string;mime:string;name:string})=>f.kind==='file'&&(['image/png','image/jpeg','image/gif','image/webp','application/pdf','text/plain','text/html'].includes(f.mime)||/\.(docx|xlsx|pptx|html?)$/i.test(f.name));
export async function portalFile(f:PortalItem,download:boolean){
 if(f.kind!=='file')throw error('这是一份外部链接',400);
 const object=await env.BUCKET?.get(f.objectKey);if(!object)throw error('文件暂时不可用，请联系资料负责人',404);
 let body:BodyInit=object.body,mime=f.mime,safe=['image/png','image/jpeg','image/gif','image/webp','application/pdf','text/plain'].includes(mime);
 // Web presentations retain interaction in an isolated opaque origin.
 const html=!download&&/\.html?$/i.test(f.name)&&f.size<=5*1024*1024;
 if(!download&&/\.(docx|xlsx|pptx)$/i.test(f.name)){
  try{body=officePreview(new Uint8Array(await object.arrayBuffer()),f.name);}catch{throw error('此文件无法生成内容预览，请联系负责人或下载原文件',422);}mime='text/html; charset=utf-8';safe=true;
 }else if(html){mime='text/html; charset=utf-8';safe=true;}
 if(!download&&!safe)throw error('此格式暂不支持在线预览',422);
 if(!download&&mime==='text/plain')mime='text/plain; charset=utf-8';
 return new Response(body,{headers:{'Content-Type':safe||download?mime:'application/octet-stream','Content-Disposition':(download?'attachment':'inline')+"; filename*=UTF-8''"+encodeURIComponent(f.name),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':html?webPreviewPolicy:"sandbox; default-src 'none'; img-src data:; style-src 'unsafe-inline'; frame-ancestors 'self'"}});
}
