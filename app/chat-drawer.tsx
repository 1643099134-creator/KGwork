'use client';
import {useEffect,useState,lazy,Suspense} from 'react';
import {usePathname} from 'next/navigation';
import {MessageCircle,X,Maximize2} from 'lucide-react';
const Conversations=lazy(()=>import('./messages/conversations'));
export default function ChatDrawer({user}:{user:{id:string;name:string;email:string}}){
 const pathname=usePathname();
 const [open,setOpen]=useState(false),[target,setTarget]=useState({team:'',owner:'group',context:''});
 useEffect(()=>{const f=(event:Event)=>{const d=(event as CustomEvent).detail||{};setTarget({team:d.team||new URLSearchParams(location.search).get('team')||'',owner:d.owner||'group',context:d.context||''});setOpen(true);};window.addEventListener('open-team-chat',f);return()=>window.removeEventListener('open-team-chat',f);},[]);
 useEffect(()=>{if(!open)return;const f=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false);}};window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f);},[open]);
 if(pathname.startsWith('/client/'))return null;
 return <><button className="global-chat-launcher" onClick={()=>{if(!target.team)setTarget(p=>({...p,team:new URLSearchParams(location.search).get('team')||document.querySelector<any>('select[aria-label="选择团队"],select[aria-label="切换团队"]')?.value||''}));setOpen(v=>!v);}} aria-label={open?'收起快捷聊天':'打开快捷聊天'} aria-expanded={open}><MessageCircle size={20}/>快捷聊天</button>{open&&<section className="global-chat-drawer" aria-label="快捷聊天" role="dialog"><header><strong>随时沟通</strong><a href={'/messages?team='+encodeURIComponent(target.team)+'&owner='+encodeURIComponent(target.owner)} target="_blank" rel="noreferrer" aria-label="在新窗口打开完整聊天"><Maximize2 size={17}/></a><button onClick={()=>setOpen(false)} aria-label="关闭快捷聊天"><X size={20}/></button></header><Suspense fallback={<p className="chat-opening">正在打开对话…</p>}><Conversations user={user} embedded initialTeam={target.team} initialOwner={target.owner} context={target.context} onScope={(team,owner)=>setTarget(p=>p.team===team&&p.owner===owner?p:{...p,team,owner})}/></Suspense></section>}</>;
}


