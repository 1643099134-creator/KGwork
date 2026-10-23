import {getAppUser,authConfig} from '../email-auth';
import EmailLogin from '../email-login';
import References from './workspace';
export const dynamic='force-dynamic';
export const metadata={title:'常用资料库 · KGwork 工作台'};
export default async function Page(){const u=await getAppUser();return u?<References user={{id:u.userId,name:u.displayName}}/>:<EmailLogin ready={!!authConfig()}/>;}
