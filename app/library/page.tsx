import {getAppUser,authConfig} from '../email-auth';
import EmailLogin from '../email-login';
import Library from './library';
export const dynamic='force-dynamic';
export const metadata={title:'共享文稿与文件库 · KGwork 工作台'};
export default async function Page(){const u=await getAppUser();return u?<Library user={{id:u.userId,name:u.displayName}}/>:<EmailLogin ready={!!authConfig()}/>;}
