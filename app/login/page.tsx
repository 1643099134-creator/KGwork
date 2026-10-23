import EmailLogin from '../email-login';
import {authConfig} from '../email-auth';
export const dynamic='force-dynamic';
export default function Login(){return <EmailLogin ready={!!authConfig()}/>;}
