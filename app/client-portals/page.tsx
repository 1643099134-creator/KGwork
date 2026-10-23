import {getAppUser,authConfig} from '../email-auth';
import EmailLogin from '../email-login';
import PortalWorkspace from './workspace';
import Showcase from '../showcases/workspace';
export const dynamic='force-dynamic';
export const metadata={title:'企业展示中心 · KGwork 工作台'};
export default async function Page({searchParams}:{searchParams:Promise<{platform?:string}>}){const u=await getAppUser(),params=await searchParams;if(!u)return <EmailLogin ready={!!authConfig()}/>;const user={id:u.userId,name:u.displayName};return params.platform==='materials'?<PortalWorkspace user={user}/>:<Showcase user={user}/>;}
