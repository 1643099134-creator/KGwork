export function miniTasks(notes:any[],user:string,team:string,today:string,all=false){
 const order:Record<string,number>={urgent:0,high:1,normal:2,low:3};
 return notes.filter(n=>n.kind==='task'&&n.team===team&&n.assignee===user&&!n.archived&&n.status!=='done'&&(all||!n.due||n.due<=today||n.status==='doing'||n.status==='review')).sort((a,b)=>(order[a.priority]??2)-(order[b.priority]??2)||(a.due||'9999').localeCompare(b.due||'9999')||(b.updated||0)-(a.updated||0));
}
