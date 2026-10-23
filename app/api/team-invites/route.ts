import {db,identity,member,str,json,error,failure} from '../../task-service';
export async function GET(req:Request){try{const u=await identity(),team=str(new URL(req.url).searchParams.get('team'),80),m=await member(team,u.userId);if(m.role!=='admin')throw error('只有管理员可以查看邮箱邀请',403);const rows=await db().prepare("SELECT email,role,claimed,created FROM email_team_invites WHERE team=? AND active=1 ORDER BY created DESC").bind(team).all();return json({items:rows.results});}catch(e){return failure(e);}}
export async function POST(req:Request){try{
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)throw error('来源不正确',403);if(Number(req.headers.get('content-length')||0)>2048)throw error('请求过长');
 const u=await identity(),p:any=await req.json(),team=str(p.team,80),m=await member(team,u.userId),d=db();if(m.role!=='admin')throw error('只有管理员可以添加成员邮箱',403);
 const email=str(p.email,254).toLowerCase();if(!/^\S+@[^\s@]+\.[^\s@]+$/.test(email))throw error('请填写正确的邮箱');
 if(p.action==='revoke'){const r=await d.prepare("UPDATE email_team_invites SET active=0 WHERE team=? AND email=? AND claimed='' AND active=1").bind(team,email).run();if(!r.meta.changes)throw error('此邀请已使用或已撤销；已加入成员请在成员列表管理',409);return json({ok:true});}
 if(p.action!=='add')throw error('未知操作');const existing=await d.prepare('SELECT user FROM members WHERE team=? AND lower(email)=?').bind(team,email).first();if(existing)return json({ok:true,already:true});
 const role=p.role==='viewer'?'viewer':'member';await d.prepare("INSERT INTO email_team_invites (team,email,role,active,claimed,creator,created) VALUES (?,?,?,1,'',?,?) ON CONFLICT(team,email) DO UPDATE SET role=excluded.role,active=1,claimed='',creator=excluded.creator,created=excluded.created").bind(team,email,role,u.userId,Date.now()).run();return json({ok:true});
 }catch(e){return failure(e);}}
