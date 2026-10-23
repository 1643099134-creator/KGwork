import {getAppUser,authConfig} from './email-auth';
import EmailLogin from './email-login';
import Notebook from './notebook';
import Dashboard from './dashboard';
import Members from './members/workspace';
import {GET as workspace} from './api/workspace/route';
export const dynamic='force-dynamic';
export default async function Home({searchParams}:{searchParams:Promise<{team?:string;view?:string;area?:string;members?:string}>}){
 const user=await getAppUser();if(!user)return <EmailLogin ready={!!authConfig()}/>;
 const query=await searchParams;if(query.members==='1')return <Members user={{id:user.userId,name:user.displayName}}/>;let team=query.team||'',initialData:any=null;
 if(!team){const r=await workspace(new Request('https://notebook.local/api/workspace'));if(r.ok){const j:any=await r.json();team=j.teams[0]?.id||'';}}
 if(team){const r=await workspace(new Request('https://notebook.local/api/workspace?team='+encodeURIComponent(team)));if(r.ok)initialData=await r.json();}
 if(!query.view&&!query.area&&!query.members)return <Dashboard user={{id:user.userId,name:user.displayName,email:user.email}} initialData={initialData} initialTeam={team}/>;
 const view=query.members==='1'?'writing':['all','writing','pinned','archive','today','board'].includes(query.view||'')?query.view!:'all';
 const area=query.area==='tasks'||view==='board'||view==='today'?'tasks':view==='writing'||query.area==='collaboration'||query.members==='1'?'collaboration':'notes';
 return <Notebook user={{id:user.userId,name:user.displayName,email:user.email}} initialData={initialData} initialTeam={team} initialArea={area} initialView={view} initialManage={query.members==='1'}/>;
}

