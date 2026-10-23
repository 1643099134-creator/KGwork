import {getAppUser,authConfig} from '../email-auth';
import EmailLogin from '../email-login';
import CalendarDesk from './calendar-desk';
export const dynamic='force-dynamic';
export const metadata={title:'工作日程 · KGwork 工作台'};
export default async function Calendar(){const u=await getAppUser();return u?<CalendarDesk user={{id:u.userId,name:u.displayName,email:u.email}}/>:<EmailLogin ready={!!authConfig()}/>;}
