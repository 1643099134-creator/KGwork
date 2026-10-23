import {claimEmailInvites} from './email-membership';
import {cookies} from 'next/headers';
import {env} from 'cloudflare:workers';
import {getChatGPTUser} from './chatgpt-auth';
import {cache} from 'react';
// Local password auth is available whenever the D1 database is bound.
export function authConfig(){return env.DB?{db:env.DB}:null;}
async function withProfile<T extends {userId:string;displayName:string}>(user:T):Promise<T>{const profile=await env.DB?.prepare('SELECT name FROM user_profiles WHERE user=?').bind(user.userId).first<{name:string}>();return profile?{...user,displayName:profile.name}:user;}
export type AppUser={userId:string;email:string;displayName:string;fullName:null};
export const getAppUser=cache(async function getAppUser(){
 // Starter mock identity exists only in the loopback development server.
 if(process.env.NODE_ENV!=='production'){const local=await getChatGPTUser();if(local)return withProfile(local);}
 if(!env.DB)return null;const token=(await cookies()).get('bn_access')?.value;if(!token)return null;
 try{
  const row=await env.DB.prepare('SELECT u.email,u.name,u.must_change FROM local_sessions s JOIN local_users u ON u.email=s.email WHERE s.token=? AND s.expires>?').bind(token,Date.now()).first<{email:string;name:string;must_change:number}>();
  if(!row)return null;
  const email=row.email.toLowerCase();
  const user=await withProfile({userId:'lu:'+email,email,displayName:row.name||email.split('@')[0],fullName:null});
  await claimEmailInvites(user);
  // Accounts flagged must_change stay "not fully signed in" until a new password is set.
  if(row.must_change)return null;
  return user;
 }catch{throw Object.assign(new Error('登录服务暂时连接不上，请稍后重试；不会因此退出登录'),{status:503});}
});
