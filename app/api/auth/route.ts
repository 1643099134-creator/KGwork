import {claimEmailInvites} from '../../email-membership';
import {cookies} from 'next/headers';
import {env} from 'cloudflare:workers';
import {saveSession,clearSession,SESSION_DAYS} from '../../session-cookies';
const result=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
const clean=v=>typeof v==='string'?v.trim():'';
function newToken(){const bytes=new Uint8Array(24);crypto.getRandomValues(bytes);return Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');}
export async function POST(req:Request){try{
 if(req.headers.get('origin')!==new URL(req.url).origin)return result({error:'请求来源不正确'},403);
 if(Number(req.headers.get('content-length')||0)>4096)return result({error:'请求过大'},400);
 const p:any=await req.json(),jar=await cookies(),secure=new URL(req.url).protocol==='https:';
 if(!env.DB)return result({error:'登录服务尚未就绪，请联系管理员'},503);
 const token=jar.get('bn_access')?.value;
 if(p.action==='logout'){if(token)await env.DB.prepare('DELETE FROM local_sessions WHERE token=?').bind(token).run().catch(()=>{});clearSession(jar);return result({ok:true});}
 if(p.action==='session'){
  if(!token)return result({error:'请登录'},401);
  const row=await env.DB.prepare('SELECT u.email,u.must_change FROM local_sessions s JOIN local_users u ON u.email=s.email WHERE s.token=? AND s.expires>?').bind(token,Date.now()).first<{email:string;must_change:number}>();
  if(!row){clearSession(jar);return result({error:'登录已失效，请重新登录'},401);}
  return row.must_change?result({ok:true,must_change:true,email:row.email}):result({ok:true});
 }
 if(p.action==='change'){
  const current=typeof p.current==='string'?p.current:'';
  if(!token)return result({error:'登录已失效，请重新登录'},401);
  const row=await env.DB.prepare('SELECT u.email,u.password,u.name,u.must_change FROM local_sessions s JOIN local_users u ON u.email=s.email WHERE s.token=? AND s.expires>?').bind(token,Date.now()).first<{email:string;password:string;name:string;must_change:number}>();
  if(!row){clearSession(jar);return result({error:'登录已失效，请重新登录'},401);}
  if(row.password.toLowerCase()!==current.toLowerCase())return result({error:'当前密码不正确'},400);
  const next=typeof p.newPassword==='string'?p.newPassword:'';
  if(next.length<6||next.length>128)return result({error:'新密码至少 6 位，最多 128 位'},400);
  await env.DB.batch([
   env.DB.prepare('UPDATE local_users SET password=?,must_change=0 WHERE email=?').bind(next,row.email),
   env.DB.prepare('DELETE FROM local_sessions WHERE token<>? AND email=?').bind(token,row.email)
  ]);
  await claimEmailInvites({userId:'lu:'+row.email,email:row.email.toLowerCase(),displayName:row.name||row.email.split('@')[0]}).catch(()=>{});
  return result({ok:true});
 }
 const email=clean(p.email).toLowerCase();
 if(email.length>254||!/^\S+@\S+\.\S+$/.test(email))return result({error:'请填写正确的邮箱地址'},400);
 const password=typeof p.password==='string'?p.password:'';
 if(!password||password.length>128)return result({error:'请输入密码'},400);
 if(p.action==='login'){
  const row=await env.DB.prepare('SELECT email,password,name,must_change FROM local_users WHERE email=?').bind(email).first<{email:string;password:string;name:string;must_change:number}>();
  if(!row||row.password.toLowerCase()!==password.toLowerCase())return result({error:'邮箱或密码不正确'},400);
  const sessionToken=newToken(),expires=Date.now()+SESSION_DAYS*86400000;
  await env.DB.batch([
   env.DB.prepare('DELETE FROM local_sessions WHERE expires<?').bind(Date.now()),
   env.DB.prepare('INSERT INTO local_sessions (token,email,expires) VALUES (?,?,?)').bind(sessionToken,email,expires)
  ]);
  saveSession(jar,sessionToken,secure);
  await claimEmailInvites({userId:'lu:'+email,email,displayName:row.name||email.split('@')[0]}).catch(()=>{});
  return row.must_change?result({ok:true,must_change:true}):result({ok:true});
 }
 return result({error:'未知操作'},400);
 }catch(e:any){return result({error:e.status?e.message:'登录服务暂时不可用，请稍后重试'},e.status||502);}}
