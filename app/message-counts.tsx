'use client';
import {openChat} from './chat-events';
import {useCallback,useSyncExternalStore} from 'react';
import {MessageCircle,Sparkles} from 'lucide-react';
type Counts={human:number;assistant:number;projects?:number;projectReviews?:number;projectOverdue?:number};
const feeds=new Map<string,{snapshot:Counts|null;listeners:Set<()=>void>;stop?:()=>void}>();
function feed(team:string){let f=feeds.get(team);if(!f){f={snapshot:null,listeners:new Set()};feeds.set(team,f);}return f;}
export function useUnread(team?:string){
 return useSyncExternalStore(useCallback((listener:()=>void)=>{
  if(!team)return ()=>{};const f=feed(team);f.listeners.add(listener);
  if(!f.stop){let alive=true,pending=false;const load=async()=>{if(document.hidden||pending)return;pending=true;try{const r=await fetch('/api/unread?team='+encodeURIComponent(team),{cache:'no-store',signal:AbortSignal.timeout(15000)});if(r.ok){const j:any=await r.json();if(alive&&(f.snapshot?.human!==j.human||f.snapshot?.assistant!==j.assistant||f.snapshot?.projects!==j.projects||f.snapshot?.projectOverdue!==j.projectOverdue||f.snapshot?.projectReviews!==j.projectReviews)){f.snapshot=j;f.listeners.forEach(fn=>fn());}}}catch{}finally{pending=false;}};
   load();const timer=setInterval(load,6000);window.addEventListener('messages-read',load);document.addEventListener('visibilitychange',load);
   f.stop=()=>{alive=false;clearInterval(timer);window.removeEventListener('messages-read',load);document.removeEventListener('visibilitychange',load);f.stop=undefined;};
  }
  return()=>{f.listeners.delete(listener);if(!f.listeners.size){f.stop?.();feeds.delete(team);}};
 },[team]),useCallback(()=>team?feed(team).snapshot:null,[team]),()=>null);
}
export default function MessageShortcuts({team}:{team:string}){const counts=useUnread(team);return <div className="message-shortcuts"><a onClick={e=>{e.preventDefault();openChat({team});}} className="chat-reminder" href={'/messages?team='+encodeURIComponent(team)} aria-label={'伙伴消息，'+(counts?.human||0)+'条未读'} title="伙伴消息"><MessageCircle size={18}/><span>伙伴</span>{!!counts?.human&&<b>{counts.human}</b>}</a><a onClick={e=>{e.preventDefault();openChat({team,owner:'assistant'});}} className="assistant-reminder" href={'/messages?team='+encodeURIComponent(team)+'&owner=assistant'} aria-label={'管家消息，'+(counts?.assistant||0)+'条未读'} title="管家消息"><Sparkles size={18}/><span>管家</span>{!!counts?.assistant&&<b>{counts.assistant}</b>}</a></div>;}
