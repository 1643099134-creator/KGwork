'use client';
import {useEffect,useState} from 'react';
export default function SessionGuard({authenticated}:{authenticated:boolean}){
 const [notice,setNotice]=useState('');
 useEffect(()=>{
  if(location.pathname.startsWith('/client/'))return;
  let alive=true,pending:Promise<boolean>|null=null;const original=window.fetch.bind(window);
  const check=()=>{
   if(pending)return pending;
   const run=async()=>{try{const r=await original('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'session'}),signal:AbortSignal.timeout(18000)}),j:any=await r.json();if(!alive)return false;if(r.ok){setNotice('');if(!authenticated)window.location.reload();return true;}if(authenticated)setNotice(j.legacy?'请重新验证一次邮箱，以启用自动保持登录。当前编辑内容请先保存。':r.status===401?'登录已失效。当前页面和编辑内容会保留，请在新窗口重新登录后继续。':'网络暂时不稳定，正在重试连接；不会自动退出。');return false;}catch{if(alive&&authenticated)setNotice('网络暂时不稳定，正在重试连接；不会自动退出。');return false;}};
   pending=(async()=>navigator.locks?await navigator.locks.request('notebook-session',run):await run())().finally(()=>{pending=null;});return pending;
  };
  const wrapped:typeof fetch=async(input,init)=>{
   const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,location.href);
   if(url.origin!==location.origin||!url.pathname.startsWith('/api/')||url.pathname==='/api/auth')return original(input,init);
   const retryInput=input instanceof Request?input.clone():input;const response=await original(input,init);
   if(response.status===401&&await check())return original(retryInput,init);return response;
  };
  window.fetch=wrapped;check();const timer=setInterval(()=>{if(!document.hidden)check();},60000);
  const resume=()=>{if(!document.hidden)check();};document.addEventListener('visibilitychange',resume);window.addEventListener('online',resume);
  return()=>{alive=false;clearInterval(timer);document.removeEventListener('visibilitychange',resume);window.removeEventListener('online',resume);if(window.fetch===wrapped)window.fetch=original;};
 },[authenticated]);
 return notice?<div className="session-notice" role="status">{notice} <a href="/login" target="_blank" rel="noreferrer">打开登录窗口</a><button onClick={()=>setNotice('')} aria-label="收起登录提示">×</button></div>:null;
}

