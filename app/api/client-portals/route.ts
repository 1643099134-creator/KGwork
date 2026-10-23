import {db,identity,member,str,uid,json,error,failure,hash} from '../../task-service';
import {GET as fileGet} from '../file-space/route';
import {env} from 'cloudflare:workers';
import {readPortal,publicContent,portalFile,type PortalContent,type PortalItem} from '../../client-portal-service';
const fileKey=(f:any)=>(f.taskSource?'task':'library')+':'+f.id;
async function context(req:Request,team:string){
 const u=await identity(),m=await member(team,u.userId),d=db();
 const delegates=await d.prepare('SELECT category FROM file_delegates WHERE team=? AND user=?').bind(team,u.userId).all<any>();
 const allowed=(f:any)=>m.role==='admin'||m.role!=='viewer'&&delegates.results.some(g=>g.category===(f.category||'未分类'));
 const response=await fileGet(new Request(new URL('/api/file-space?team='+encodeURIComponent(team),req.url))),data:any=await response.json();
 if(!response.ok)throw error(data.error||'文件读取失败',response.status);
 const eligible=data.items.filter((f:any)=>['final','archived'].includes(f.record?.stage)&&allowed(f));
 return {u,m,d,allowed,eligible,canCreate:m.role==='admin'||m.role!=='viewer'&&delegates.results.length>0};
}
function editable(row:any,c:any){if(c.m.role==='viewer'||c.m.role!=='admin'&&(row.owner!==c.u.userId||!c.canCreate))throw error('仅管理员或看板负责人中的授权整理人可以操作',403);}
async function selectedContent(p:any,c:any):Promise<PortalContent>{
 const title=str(p.title,100),client=str(p.client||'',100),body=str(p.body||'',3000);if(!title)throw error('请填写看板名称');
 if(!Array.isArray(p.items)||p.items.length>60)throw error('一个看板最多60份资料');
 const seen=new Set<string>(),items:PortalItem[]=[];
 for(const choice of p.items){const key=str(choice.key,100);if(seen.has(key))throw error('同一文件不能重复添加');seen.add(key);const f=c.eligible.find((x:any)=>fileKey(x)===key);if(!f)throw error('部分文件尚未确认有效、已删除或你没有发布授权，请重新选择',409);
 const original=await c.d.prepare(f.taskSource?'SELECT * FROM task_deliverables WHERE id=? AND team=?':'SELECT * FROM library_items WHERE id=? AND team=?').bind(f.id,c.m.team).first();
 if(!original)throw error('文件已不存在',409);
 if(original.kind==='file'&&!await env.BUCKET?.head(original.object_key))throw error('文件暂不可用：'+f.name,409);
 if(original.kind==='link'){let url:URL;try{url=new URL(original.url);}catch{throw error('资料链接无效');}if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw error('资料链接无效');}
 items.push({key,name:f.name,category:str(choice.category||f.category||'项目资料',80),caption:str(choice.caption||'',500),kind:original.kind,url:original.kind==='link'?original.url:'',objectKey:original.object_key||'',mime:original.mime||'',size:original.size||0,stamp:f.updated||f.created||0});}
 return {title,client,body,color:['sage','clay','lavender','sand'].includes(p.color)?p.color:'sage',download:p.download===true,items};
}
export async function GET(req:Request){try{
 const q=new URL(req.url).searchParams,team=str(q.get('team'),80),c=await context(req,team),id=q.get('id');
 if(q.has('file')){const row=await c.d.prepare('SELECT * FROM client_portals WHERE id=? AND team=?').bind(id,team).first<any>();if(!row)throw error('看板不存在',404);editable(row,c);const index=Number(q.get('file')),f=readPortal(row.draft).items[index];if(!Number.isInteger(index)||!f||!c.eligible.some((x:any)=>fileKey(x)===f.key))throw error('文件不可访问',404);return await portalFile(f,q.get('download')==='1');}
 const rows=await c.d.prepare('SELECT * FROM client_portals WHERE team=? ORDER BY updated DESC').bind(team).all<any>();
 return json({role:c.m.role,canCreate:c.canCreate,files:c.eligible.map((f:any)=>({key:fileKey(f),name:f.name,category:f.category,kind:f.kind,mime:f.mime,size:f.size,stamp:f.updated||f.created||0,stage:f.record.stage})),boards:rows.results.filter(row=>c.m.role==='admin'||row.owner===c.u.userId).map(row=>({id:row.id,owner:row.owner,token:row.token,draft:publicContent(readPortal(row.draft)),choices:readPortal(row.draft).items.map(({key,category,caption,stamp})=>({key,category,caption,stamp})),version:row.version,published:!!row.published,publishedAt:row.published_at,expires:row.expires,hasCode:!!row.code_hash,dirty:row.published&&row.draft!==row.published,canEdit:c.canCreate&&c.m.role!=='viewer',updated:row.updated}))});
 }catch(e){return failure(e);}}
export async function POST(req:Request){try{
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)throw error('来源不正确',403);if(Number(req.headers.get('content-length')||0)>70000)throw error('内容过长');
 const p:any=await req.json(),team=str(p.team,80),c=await context(req,team),now=Date.now();
 if(!c.canCreate)throw error('请由管理员授权文件分类整理权限后管理客户看板',403);
 if(p.action==='create'){
  const content=await selectedContent({...p,items:[]},c),id=uid(),token=(uid()+uid()).replace(/-/g,'');
  await c.d.prepare('INSERT INTO client_portals (id,team,owner,token,draft,created,updated) VALUES (?,?,?,?,?,?,?)').bind(id,team,c.u.userId,token,JSON.stringify(content),now,now).run();return json({id});
 }
 const id=str(p.id,80),row=await c.d.prepare('SELECT * FROM client_portals WHERE id=? AND team=?').bind(id,team).first<any>();if(!row)throw error('看板不存在',404);editable(row,c);
 if(row.version!==p.version)throw error('看板已被更新，请刷新后重试',409);
 let statement;
 if(p.action==='save'){const content=await selectedContent(p,c);statement=c.d.prepare('UPDATE client_portals SET draft=?,version=version+1,updated=? WHERE id=? AND team=? AND version=?').bind(JSON.stringify(content),now,id,team,p.version);}
 else if(p.action==='publish'){
  const draft=readPortal(row.draft),content=await selectedContent(draft,c);if(!content.items.length)throw error('请先添加至少一份正式资料');
  const expires=Number(p.expires||0);if(!Number.isSafeInteger(expires)||expires&&expires<=now)throw error('有效期必须晚于当前时间');
  let codeHash=row.code_hash;if(p.codeMode==='remove')codeHash='';else if(p.codeMode==='set'){const code=str(p.code,80);if(code.length<6)throw error('访问码至少6个字符');codeHash=await hash(row.token+':'+code);}else if(p.codeMode!=='keep')throw error('请选择访问码设置');
  statement=c.d.prepare('UPDATE client_portals SET draft=?,published=?,code_hash=?,expires=?,published_at=?,version=version+1,updated=? WHERE id=? AND team=? AND version=?').bind(JSON.stringify(content),JSON.stringify(content),codeHash,expires,now,now,id,team,p.version);
 }else if(p.action==='stop'){statement=c.d.prepare("UPDATE client_portals SET published='',version=version+1,updated=? WHERE id=? AND team=? AND version=?").bind(now,id,team,p.version);}
 else if(p.action==='rotate'){if(row.published)throw error('请先停用看板，再更换分享链接');statement=c.d.prepare("UPDATE client_portals SET token=?,code_hash='',version=version+1,updated=? WHERE id=? AND team=? AND version=?").bind((uid()+uid()).replace(/-/g,''),now,id,team,p.version);}
 else throw error('未知操作');
 const result=await statement.run();if(!result.meta.changes)throw error('看板已被更新，请刷新重试',409);return json({ok:true});
 }catch(e){return failure(e);}}
