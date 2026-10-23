import {env} from 'cloudflare:workers';
import {db,json,failure,error} from '../../../task-service';
import {tick} from '../../../assistant-engine';
export async function POST(req:Request){try{const secret=(env as any).ASSISTANT_CRON_SECRET;if(!secret||req.headers.get('authorization')!=='Bearer '+secret)throw error('未授权',401);return json(await tick(db()));}catch(e){return failure(e);}}
