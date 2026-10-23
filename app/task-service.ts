import {getAppUser} from './email-auth';
import {env} from 'cloudflare:workers';
export const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export const error=(message:string,status=400)=>Object.assign(new Error(message),{status});
export const uid=()=>crypto.randomUUID();
export async function hash(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(n=>n.toString(16).padStart(2,'0')).join('');}
export function str(v:unknown,max=200){if(typeof v!=='string'||v.length>max)throw error('输入内容过长或格式不正确');return v.trim();}
export function db(){if(!env.DB)throw error('数据库尚未配置',503);return env.DB;}
export async function identity(){const u=await getAppUser();if(!u)throw error('请先登录',401);return u;}
export async function member(team:string,user:string){const m=await db().prepare('SELECT * FROM members WHERE team=? AND user=?').bind(team,user).first<any>();if(!m)throw error('你没有这个团队的访问权限',403);return m;}
export async function canReadTask(n:any,m:any,user:string){if(n.kind!=='task'||m.role==='admin'||n.assignee===user)return true;return !!await db().prepare('SELECT owner FROM list_permissions WHERE team=? AND owner=? AND viewer=?').bind(n.team,n.assignee,user).first();}
export async function allowedNote(id:string,team:string,m:any,user:string){const n=await db().prepare('SELECT * FROM notes WHERE id=? AND team=?').bind(id,team).first<any>();if(!n||!await canReadTask(n,m,user))throw error('任务或便签不存在，或你没有查看权限',404);return n;}
export function failure(e:any){console.error('workspace:',e.message);return json({error:e.status?e.message:'服务暂时不可用，请稍后重试'},e.status||500);}
