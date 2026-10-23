import {getAppUser,authConfig} from '../email-auth';
import EmailLogin from '../email-login';
import Conversations from './conversations';
export const dynamic='force-dynamic';
export const metadata={title:'团队对话 · KGwork 工作台'};
export default async function Messages(){const u=await getAppUser();return u?<Conversations user={{id:u.userId,name:u.displayName,email:u.email}}/>:<EmailLogin ready={!!authConfig()}/>;}
