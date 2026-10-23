import {getAppUser,authConfig} from '../email-auth';
import EmailLogin from '../email-login';
import Projects from './workspace';
export const dynamic='force-dynamic';
export default async function Page(){const u=await getAppUser();return u?<Projects user={{id:u.userId,name:u.displayName}}/>:<EmailLogin ready={!!authConfig()}/>;}
