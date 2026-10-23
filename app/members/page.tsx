import {getAppUser,authConfig} from '../email-auth';
import EmailLogin from '../email-login';
import Members from './workspace';
export const dynamic='force-dynamic';
export const metadata={title:'成员与权限中心 · KGwork 工作台'};
export default async function Page(){const u=await getAppUser();return u?<Members user={{id:u.userId,name:u.displayName}}/>:<EmailLogin ready={!!authConfig()}/>;}
