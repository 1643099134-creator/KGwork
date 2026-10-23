import {planInput,planPublic} from '../../assistant-engine';
import {env} from 'cloudflare:workers';
import {json,error,uid,hash,str,db,identity,member,allowedNote,canReadTask,failure} from '../../task-service';
export async function GET(req:Request){try{
 const u=await identity(),d=db(),url=new URL(req.url),team=url.searchParams.get('team');
 const teamsStmt=d.prepare('SELECT t.*,m.role FROM teams t JOIN members m ON m.team=t.id WHERE m.user=? ORDER BY t.created').bind(u.userId);
 if(!team){const ts=await teamsStmt.all();return json({teams:ts.results});}const [ts,roles]=await d.batch<any>([teamsStmt,d.prepare('SELECT * FROM members WHERE team=? AND user=?').bind(team,u.userId)]);const m=roles.results[0];if(!m)throw error('你没有这个团队的访问权限',403);const note=url.searchParams.get('note');
 if(note){await allowedNote(note,team,m,u.userId);const [c,r]=await Promise.all([d.prepare('SELECT * FROM comments WHERE note=? ORDER BY created').bind(note).all(),d.prepare('SELECT * FROM revisions WHERE note=? ORDER BY version DESC LIMIT 50').bind(note).all()]);return json({comments:c.results,revisions:r.results});}
 const [b,n,ms,ns,sh,grants,nc,chat,plans]=await d.batch<any>([
 d.prepare('SELECT * FROM books WHERE team=? ORDER BY rowid').bind(team),
 m.role==='admin'?d.prepare(`SELECT notes.*,(SELECT COUNT(*) FROM task_deliverables td WHERE td.note=notes.id) AS deliverableCount,(SELECT COUNT(*) FROM task_deliverables td WHERE td.note=notes.id AND td.purpose='material') AS materialCount,(SELECT COUNT(*) FROM task_deliverables td WHERE td.note=notes.id AND td.purpose='result') AS resultCount FROM notes WHERE team=? ORDER BY pinned DESC,updated DESC`).bind(team):d.prepare("SELECT notes.*,(SELECT COUNT(*) FROM task_deliverables td WHERE td.note=notes.id) AS deliverableCount FROM notes WHERE team=? AND (kind!='task' OR assignee=? OR assignee IN (SELECT owner FROM list_permissions WHERE team=? AND viewer=?)) ORDER BY pinned DESC,updated DESC").bind(team,u.userId,team,u.userId),
 d.prepare('SELECT user,name,email,role FROM members WHERE team=?').bind(team),
 d.prepare('SELECT id,note,title,created,read FROM notifications WHERE team=? AND user=? AND NOT EXISTS (SELECT 1 FROM assistant_events ae WHERE notifications.id=ae.id||char(58)||notifications.user) ORDER BY created DESC LIMIT 100').bind(team,u.userId),
 d.prepare('SELECT id,target,title,created,expires,revoked FROM task_shares WHERE team=? AND owner=? ORDER BY created DESC LIMIT 30').bind(team,u.userId),
 m.role==='admin'?d.prepare('SELECT owner,viewer FROM list_permissions WHERE team=?').bind(team):d.prepare('SELECT owner,viewer FROM list_permissions WHERE team=? AND viewer=?').bind(team,u.userId),d.prepare('SELECT COUNT(*) AS count FROM notifications WHERE team=? AND user=? AND read=0 AND NOT EXISTS (SELECT 1 FROM assistant_events ae WHERE notifications.id=ae.id||char(58)||notifications.user)').bind(team,u.userId),
 d.prepare("SELECT COUNT(*) AS count FROM chat_messages cm WHERE cm.team=? AND cm.sender!=? AND cm.room NOT LIKE 'assistant:%' AND (cm.room='group' OR cm.recipient=? OR (?='admin' AND cm.room LIKE 'private:%')) AND (cm.held=0 OR ?='admin') AND cm.seq>COALESCE((SELECT lastseq FROM chat_reads cr WHERE cr.team=cm.team AND cr.user=? AND cr.room=cm.room),0)").bind(team,u.userId,u.userId,m.role,m.role,u.userId),
 d.prepare('SELECT * FROM task_plans WHERE team=?').bind(team)]);const chatCount=chat.results[0];
 return json({chatUnread:chatCount?.count||0,teams:ts.results,books:b.results,notes:n.results.map((note:any)=>({...note,assistant:planPublic(plans.results.find(p=>p.note===note.id))})),members:ms.results,notifications:ns.results,unreadCount:nc.results[0]?.count||0,shares:sh.results,grants:grants.results,visibleOwners:ms.results.filter((person:any)=>m.role==='admin'||person.user===u.userId||grants.results.some((g:any)=>g.owner===person.user)),role:m.role});
 }catch(e){return failure(e);}}
export async function POST(req:Request){try{
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw error('请求来源不正确',403);
 if(Number(req.headers.get('content-length')||0)>150000)throw error('内容过大');
 const u=await identity(),d=db(),p:any=await req.json(),action=p.action,now=Date.now();
 if(action==='createTeam'){const admin=(env as any).TEAM_ADMIN_EMAIL;if(admin&&u.email.toLowerCase()!==admin.toLowerCase())throw error('请使用管理员提供的邀请码加入团队',403);const name=str(p.name,60);if(!name)throw error('请填写团队名称');const count=await d.prepare('SELECT COUNT(*) AS n FROM members WHERE user=?').bind(u.userId).first<any>();if(count.n>=20)throw error('最多加入20个团队');const team=uid();await d.batch([d.prepare('INSERT INTO teams VALUES (?,?,?)').bind(team,name,now),d.prepare('INSERT INTO members VALUES (?,?,?,?,?)').bind(team,u.userId,u.displayName,u.email,'admin'),...['随手记','团队写作','工作安排'].map(name=>d.prepare('INSERT INTO books VALUES (?,?,?)').bind(uid(),team,name))]);return json({team});}
 if(action==='join'){const h=await hash(str(p.code,100)),i=await d.prepare('SELECT * FROM invites WHERE hash=? AND used=0 AND expires>?').bind(h,now).first<any>();if(!i)throw error('邀请码无效、已使用或已过期');if(await d.prepare('SELECT user FROM members WHERE team=? AND user=?').bind(i.team,u.userId).first())throw error('你已经在这个团队中');const r=await d.batch([d.prepare('INSERT INTO members (team,user,name,email,role) SELECT team,?,?,?,role FROM invites WHERE hash=? AND used=0 AND expires>?').bind(u.userId,u.displayName,u.email,h,now),d.prepare('UPDATE invites SET used=1 WHERE hash=? AND used=0 AND expires>?').bind(h,now)]);if(!r[0].meta.changes)throw error('邀请码已使用');return json({team:i.team});}
 const team=str(p.team,80),m=await member(team,u.userId);
 if(action==='readNotifications'){if(p.id)await d.prepare('UPDATE notifications SET read=1 WHERE id=? AND team=? AND user=?').bind(str(p.id,80),team,u.userId).run();else await d.prepare('UPDATE notifications SET read=1 WHERE team=? AND user=?').bind(team,u.userId).run();return json({ok:true});}
 if(action==='setViewers'){
 if(m.role!=='admin')throw error('只有管理员可以设置清单查看权限',403);
 const owner=str(p.owner,80),viewers=Array.isArray(p.viewers)?[...new Set(p.viewers.map((v:unknown)=>str(v,80)))]:[];
 const people=await d.prepare('SELECT user FROM members WHERE team=?').bind(team).all<any>();
 if(!people.results.some(x=>x.user===owner)||viewers.length>100||viewers.some(v=>!people.results.some(x=>x.user===v)))throw error('只能授权本团队成员');
 await d.batch([d.prepare('DELETE FROM list_permissions WHERE team=? AND owner=?').bind(team,owner),...viewers.filter(v=>v!==owner).map(v=>d.prepare('INSERT INTO list_permissions VALUES (?,?,?)').bind(team,owner,v))]);return json({ok:true});
 }
 if(action==='shareTasks'){
 if(m.role!=='admin')throw error('只有管理员可以创建外部分享链接',403);
const target=str(p.target,80);if(m.role!=='admin'&&target!==u.userId)throw error('只能分享自己的任务清单',403);if(!await d.prepare('SELECT user FROM members WHERE team=? AND user=?').bind(team,target).first())throw error('成员不存在');const ids=Array.isArray(p.ids)?[...new Set(p.ids.map((id:unknown)=>str(id,80)))]:[];if(!ids.length||ids.length>200)throw error('请选择1至200项任务');const tasks=await d.prepare("SELECT id FROM notes WHERE team=? AND assignee=? AND kind='task' AND archived=0").bind(team,target).all<any>();if(ids.some(id=>!tasks.results.some(n=>n.id===id)))throw error('只能分享该成员当前有权限的任务',403);const token=uid()+uid(),id=uid(),days=[1,7,30].includes(p.days)?p.days:7,expires=now+days*86400000;await d.prepare('INSERT INTO task_shares (id,hash,team,owner,target,taskids,title,created,expires,revoked) VALUES (?,?,?,?,?,?,?,?,?,0)').bind(id,await hash(token),team,u.userId,target,JSON.stringify(ids),str(p.title,100)||'工作任务清单',now,expires).run();return json({id,url:new URL('/share/'+token,req.url).href,expires});}
 if(action==='revokeShare'){const r=await d.prepare('UPDATE task_shares SET revoked=1 WHERE id=? AND team=? AND owner=?').bind(str(p.id,80),team,u.userId).run();if(!r.meta.changes)throw error('分享不存在',404);return json({ok:true});}
 if(m.role==='viewer')throw error('你是只读成员，无法修改内容',403);
 if(action==='invite'){if(m.role!=='admin')throw error('只有管理员可以邀请成员',403);const code=uid()+uid(),role=['member','viewer'].includes(p.role)?p.role:'member';await d.prepare('INSERT INTO invites VALUES (?,?,?,?,0)').bind(await hash(code),team,role,now+86400000).run();return json({code,expires:now+86400000});}
 if(action==='role'){if(m.role!=='admin')throw error('只有管理员可以管理权限',403);if(p.user===u.userId)throw error('不能更改自己的管理员身份');const role=str(p.role);if(!['member','viewer','remove'].includes(role))throw error('无效权限');if(role==='remove')await d.batch([d.prepare("UPDATE email_team_invites SET active=0 WHERE team=? AND lower(email) IN (SELECT lower(email) FROM members WHERE team=? AND user=? AND role!='admin')").bind(team,team,p.user),d.prepare("DELETE FROM members WHERE team=? AND user=? AND role!='admin'").bind(team,p.user),d.prepare('UPDATE task_shares SET revoked=1 WHERE team=? AND target=?').bind(team,p.user),d.prepare('DELETE FROM list_permissions WHERE team=? AND (owner=? OR viewer=?)').bind(team,p.user,p.user)]);else await d.prepare("UPDATE members SET role=? WHERE team=? AND user=? AND role!='admin'").bind(role,team,p.user).run();return json({ok:true});}
 if(action==='book'){const name=str(p.name,60);if(!name)throw error('请填写分类名称');const id=uid();await d.prepare('INSERT INTO books VALUES (?,?,?)').bind(id,team,name).run();return json({id});}
 if(action==='comment'){
 const note=str(p.note,80),body=str(p.body,5000);if(!body)throw error('请填写评论');const task=await allowedNote(note,team,m,u.userId);if(task.kind==='task'&&m.role!=='admin'&&task.assignee!==u.userId)throw error('你对此任务只有查看权限',403);
 const clientId=p.clientId?str(p.clientId,80):'',commentId=clientId?await hash('feedback:'+team+':'+u.userId+':'+clientId):uid();if(await d.prepare('SELECT id FROM comments WHERE id=?').bind(commentId).first())return json({ok:true});
 const commands=[d.prepare('INSERT INTO comments VALUES (?,?,?,?,?)').bind(commentId,note,body,u.displayName,now)];
 if(task.kind==='task'){
 const people=await d.prepare('SELECT user,name,email,role FROM members WHERE team=? ORDER BY rowid').bind(team).all<any>();
 const admins=people.results.filter(x=>x.role==='admin'),manager=admins.find(x=>x.email.toLowerCase()===(env.TEAM_ADMIN_EMAIL||'').toLowerCase())||admins[0],assignee=people.results.find(x=>x.user===task.assignee);
 const receivers=[...new Set([...admins.map(x=>x.user),...(assignee?[assignee.user]:[])])].filter(x=>x!==u.userId);
 for(const receiver of receivers)commands.push(d.prepare('INSERT INTO notifications (id,team,user,note,title,created) VALUES (?,?,?,?,?,?)').bind(uid(),team,receiver,note,u.displayName+'反馈了任务：'+task.title,now));
 const owner=assignee&&assignee.role!=='admin'?assignee.user:m.role!=='admin'?u.userId:'';
 if(owner&&manager){const mute=await d.prepare('SELECT muted FROM chat_mutes WHERE team=? AND user=?').bind(team,u.userId).first<any>();const link=new URL('/tasks',req.url);link.searchParams.set('team',team);link.searchParams.set('task',note);const message='【工作反馈】'+task.title+'\n'+body+'\n查看任务：'+link.href;
 commands.push(d.prepare('INSERT INTO chat_messages (team,room,sender,recipient,author,body,created,held) VALUES (?,?,?,?,?,?,?,?)').bind(team,'private:'+owner,u.userId,u.userId===owner?manager.user:owner,u.displayName,message,now,mute?.muted?1:0));}
 }
 try{await d.batch(commands);}catch(e){if(clientId&&await d.prepare('SELECT id FROM comments WHERE id=?').bind(commentId).first())return json({ok:true});throw e;}return json({ok:true});}
 if(action==='save'){
 const n=p.note||{},id=n.id?str(n.id,80):uid();
 const previous=n.id?await allowedNote(id,team,m,u.userId):null;
 const kind=['note','document','task'].includes(n.kind)?n.kind:'note';
 if((previous?.kind==='task'||kind==='task')&&m.role!=='admin'){
 if(previous&&previous.assignee!==u.userId)throw error('你对此任务只有查看权限',403);
 if(!previous){if(kind!=='task'||n.assignee!==u.userId)throw error('只能给自己添加任务',403);}else if(previous.kind!=='task'||kind!=='task')throw error('只有管理员可以转换任务',403);
 if(previous)for(const field of ['title','body','book','color','assignee','due','pinned','archived','priority'])if(n[field]!==undefined&&n[field]!==previous[field])throw error('任务内容由管理员维护，你可以更新进度或发表评论',403);
 }
 const title=str(n.title,200)||'无标题便签',body=str(n.body,50000),book=str(n.book,80),assignee=str(n.assignee||'',80),due=str(n.due||'',10);
 if(!await d.prepare('SELECT id FROM books WHERE id=? AND team=?').bind(book,team).first())throw error('请选择有效分类');
 
 if(assignee&&!await d.prepare("SELECT user FROM members WHERE team=? AND user=? AND role!='viewer'").bind(team,assignee).first())throw error('负责人需要是团队中的可编辑成员');
 if(due&&!/^\d{4}-\d{2}-\d{2}$/.test(due))throw error('日期格式不正确');
 const color=['yellow','pink','blue','green','purple'].includes(n.color)?n.color:'yellow',priority=['low','normal','high','urgent'].includes(n.priority)?n.priority:previous?.priority||'normal',pinned=n.pinned?1:0,archived=n.archived?1:0;
 let status=['todo','doing','review','done'].includes(n.status)?n.status:'todo',progress=n.progress===undefined?(previous?.progress||0):Number(n.progress);
 if(!Number.isInteger(progress)||progress<0||progress>100)throw error('进度须为0至100的整数');
 if(status==='done'||status==='review')progress=100;else if(status==='todo')progress=0;else if(progress===100)status=m.role==='admin'?'done':'review';if(kind==='task'&&m.role!=='admin'&&status==='done')status='review';
 const oldPlan=kind==='task'?await d.prepare('SELECT * FROM task_plans WHERE note=? AND team=?').bind(id,team).first<any>():null;const assistant=kind==='task'?planInput(m.role==='admin'||!previous?n.assistant||planPublic(oldPlan):planPublic(oldPlan),oldPlan):undefined;
 const version=previous?Number(n.version)+1:1;if(previous&&previous.version!==Number(n.version))throw error('这项内容已被其他成员修改。草稿已保留，请刷新后合并。',409);
 if(kind==='task'&&m.role!=='admin'&&n.status==='done'&&assistant?.reviewRequired===false)status='done';
 const creator=previous?.creator||u.userId,snapshot={id,team,title,body,book,assignee,due,color,kind,status,pinned,archived,version,updated:now,editor:u.displayName,priority,progress,creator,assistant};
 const assigned=kind==='task'&&!archived&&assignee&&(!previous||previous.kind!=='task'||previous.assignee!==assignee),noticeId=assigned?uid():null;
 const revisionId=uid(),commands=[];
 if(previous){
 commands.push(d.prepare('INSERT INTO revisions (id,note,version,snapshot,editor,created) SELECT ?,id,?,?,?,? FROM notes WHERE id=? AND team=? AND version=?').bind(revisionId,version,JSON.stringify(snapshot),u.displayName,now,id,team,n.version));
 if(noticeId)commands.push(d.prepare("INSERT INTO notifications (id,team,user,note,title,created) SELECT ?,?,?,?,?,? FROM notes WHERE id=? AND team=? AND version=?").bind(noticeId,team,assignee,id,'你收到新任务：'+title,now,id,team,n.version));
 if(kind==='task'&&(previous.status!==status||previous.progress!==progress))commands.push(d.prepare("INSERT INTO notifications (id,team,user,note,title,created) SELECT ? || m.user,m.team,m.user,?,?,? FROM members m WHERE m.team=? AND m.role='admin' AND m.user!=? AND EXISTS (SELECT 1 FROM notes WHERE id=? AND team=? AND version=?)").bind(uid(),id,u.displayName+'更新了任务进度：'+title+'（'+progress+'%）',now,team,u.userId,id,team,n.version));
 commands.push(d.prepare('UPDATE notes SET book=?,title=?,body=?,color=?,kind=?,status=?,assignee=?,due=?,pinned=?,archived=?,version=version+1,updated=?,editor=?,priority=?,progress=?,creator=? WHERE id=? AND team=? AND version=?').bind(book,title,body,color,kind,status,assignee,due,pinned,archived,now,u.displayName,priority,progress,creator,id,team,n.version));
 }else{
 commands.push(d.prepare('INSERT INTO notes (id,team,book,title,body,color,kind,status,assignee,due,pinned,archived,version,updated,editor,priority,progress,creator) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,team,book,title,body,color,kind,status,assignee,due,pinned,archived,1,now,u.displayName,priority,progress,creator),d.prepare('INSERT INTO revisions VALUES (?,?,?,?,?,?)').bind(revisionId,id,1,JSON.stringify(snapshot),u.displayName,now));
 if(noticeId)commands.push(d.prepare('INSERT INTO notifications (id,team,user,note,title,created) VALUES (?,?,?,?,?,?)').bind(noticeId,team,assignee,id,'你收到新任务：'+title,now));
 }
 const noteWriteIndex=commands.length-1;if(kind==='task'&&(m.role==='admin'||!previous))commands.push(d.prepare('INSERT INTO task_plans (note,team,time,reminders,review_required,updated) SELECT id,team,?,?,?,? FROM notes WHERE id=? AND team=? AND version=? AND EXISTS (SELECT 1 FROM revisions WHERE id=?) ON CONFLICT(note) DO UPDATE SET time=excluded.time,reminders=excluded.reminders,review_required=excluded.review_required,updated=excluded.updated').bind(assistant!.time,JSON.stringify(assistant!.reminders),assistant!.reviewRequired?1:0,now,id,team,version,revisionId));
 const results=await d.batch(commands);if(previous&&!results[noteWriteIndex].meta.changes)throw error('其他成员刚刚保存了修改，草稿已保留。',409);
 return json({note:snapshot,notificationCreated:!!noticeId});
 }
 throw error('未知操作');
 }catch(e){return failure(e);}}
