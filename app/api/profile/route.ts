import {identity,db,json,error,str,failure} from '../../task-service';
export async function POST(req:Request){try{
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)throw error('请求来源不正确',403);if(Number(req.headers.get('content-length')||0)>1000)throw error('内容过长');const u=await identity(),p:any=await req.json(),name=str(p.name,40);if(!name||/[\r\n\x00-\x1f]/.test(name))throw error('请填写1至40字的名称');await db().batch([db().prepare('INSERT INTO user_profiles (user,name) VALUES (?,?) ON CONFLICT(user) DO UPDATE SET name=excluded.name').bind(u.userId,name),db().prepare('UPDATE members SET name=? WHERE user=?').bind(name,u.userId)]);return json({name});
 }catch(e){return failure(e);}}
