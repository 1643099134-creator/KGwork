import {getAppUser,authConfig} from '../email-auth';
import EmailLogin from '../email-login';
import Desk from './workspace';
export const dynamic='force-dynamic';
export const metadata={title:'工作管家 · KGwork 工作台'};
export default async function Page(){const u=await getAppUser();return u?<Desk user={{id:u.userId,name:u.displayName}}/>:<EmailLogin ready={!!authConfig()}/>;}
