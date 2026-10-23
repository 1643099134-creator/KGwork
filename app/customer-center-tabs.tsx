'use client';
import {Presentation,FolderOpen} from 'lucide-react';
export default function CustomerCenterTabs({team,active}:{team:string;active:'showcase'|'materials'}){
 const tabs=[{key:'showcase',name:'展示平台',description:'企业网页与方案演示',Icon:Presentation},{key:'materials',name:'资料平台',description:'资料看板与对外分享',Icon:FolderOpen}] as const;
 return <nav className="customer-center-tabs" aria-label="企业展示中心栏目">{tabs.map(({key,name,description,Icon})=><a key={key} href={'/client-portals?platform='+key+(team?'&team='+encodeURIComponent(team):'')} className={active===key?'active':''} aria-current={active===key?'page':undefined} onClick={e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(!window.dispatchEvent(new Event('before-team-navigate',{cancelable:true})))e.preventDefault();}}><Icon size={22}/><span><strong>{name}</strong><small>{description}</small></span></a>)}</nav>;
}
