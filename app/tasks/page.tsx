import {getAppUser,authConfig} from '../email-auth';
import EmailLogin from '../email-login';
import TaskDesk from './task-desk';
import {GET as workspace} from '../api/workspace/route';
export const dynamic='force-dynamic';
export const metadata={title:'我的任务与派发 · KGwork 工作台'};
export default async function Tasks({searchParams}:{searchParams:Promise<{team?:string;list?:string}>}){
 const u=await getAppUser();if(!u)return <EmailLogin ready={!!authConfig()}/>;
 const query=await searchParams;let team=query.team||'',initialData:any=null;
 if(!team){const r=await workspace(new Request('https://notebook.local/api/workspace'));if(r.ok){const j:any=await r.json();team=j.teams[0]?.id||'';}}
 if(team){const r=await workspace(new Request('https://notebook.local/api/workspace?team='+encodeURIComponent(team)));if(r.ok)initialData=await r.json();}
 const target=query.list==='unassigned'&&initialData?.role==='admin'?'unassigned':query.list==='mine'?u.userId:initialData?.role==='admin'?'overview':u.userId;
 return <TaskDesk user={{id:u.userId,name:u.displayName,email:u.email}} initialData={initialData} initialTeam={team} initialTarget={target}/>;
}
