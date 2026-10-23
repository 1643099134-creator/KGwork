import {db,hash} from '../../task-service';
export const dynamic='force-dynamic';
export const metadata={title:'任务清单 · KGwork 工作台',robots:{index:false,follow:false},referrer:'no-referrer'};
const status:any={todo:'待办',doing:'进行中',review:'待验收',done:'已完成'},priority:any={urgent:'紧急',high:'高优先级',normal:'普通',low:'低优先级'};
export default async function SharedTasks({params}:{params:Promise<{token:string}>}){
 const {token}=await params,d=db();
 const share=token.length<=100?await d.prepare('SELECT s.*,m.name FROM task_shares s JOIN members m ON m.team=s.team AND m.user=s.target WHERE s.hash=? AND s.revoked=0 AND s.expires>?').bind(await hash(token),Date.now()).first<any>():null;
 if(!share)return <main className="shared-tasks"><a href="/">KGwork 工作台</a><h1>分享链接已失效</h1><p>链接可能已到期或被撤销，请联系分享者获取新链接。</p></main>;
 const ids: string[]=JSON.parse(share.taskids);const rows=await d.prepare("SELECT id,title,status,priority,progress,due,updated FROM notes WHERE team=? AND assignee=? AND kind='task' AND archived=0 ORDER BY CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,due").bind(share.team,share.target).all<any>();
 const tasks=rows.results.filter(n=>ids.includes(n.id));
 return <main className="shared-tasks"><div className="eyebrow">KGwork 工作台 · 只读任务清单</div><h1>{share.title}</h1><p>{share.name} · {tasks.length} 项任务 · {new Date(share.expires).toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai'})}到期</p><div className="share-warning">仅展示已选任务的标题、进度、优先级和截止日期。链接持有人可查看，请勿转发给无关人员。</div>{tasks.map(n=><article className="shared-row" key={n.id}><div><span className={'priority '+n.priority}>{priority[n.priority]||'普通'}</span><span className={'status '+n.status}>{status[n.status]}</span></div><h2>{n.title}</h2><div className="task-progress"><span style={{width:(n.status==='done'?100:n.progress)+'%'}}/></div><p>进度 {n.status==='done'?100:n.progress}%{n.due?' · 截止 '+n.due:''}</p></article>)}{!tasks.length&&<p>当前没有可展示的任务，任务可能已归档或重新分配。</p>}<footer>这是只读分享，无法修改任务。每次打开显示所选任务的最新进度。</footer></main>;
}
