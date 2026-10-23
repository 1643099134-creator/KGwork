import {str,error} from './task-service';
export async function audience(d:any,team:string,p:any){
 const people=await d.prepare('SELECT user FROM members WHERE team=?').bind(team).all(),groups=await d.prepare('SELECT id FROM library_groups WHERE team=?').bind(team).all();
 const list=(v:any)=>Array.isArray(v)?[...new Set(v.map((x:unknown)=>str(x,80)))]:[];const allowed=list(p.allowed),denied=list(p.denied),chosen=list(p.groups);
 if(allowed.length+denied.length+chosen.length>300||[...allowed,...denied].some(x=>!people.results.some((m:any)=>m.user===x))||chosen.some(x=>!groups.results.some((g:any)=>g.id===x)))throw error('请重新选择当前团队成员或群组');
 return {visibility:['private','custom','team'].includes(p.visibility)?p.visibility:'team',allowed:JSON.stringify(allowed),denied:JSON.stringify(denied),groups:JSON.stringify(chosen)};
}
export async function association(d:any,team:string,user:string,role:string,p:any){const task=p.task?str(p.task,80):null,category=str(p.category||'',40);if(task){const note=await d.prepare("SELECT id,assignee FROM notes WHERE id=? AND team=? AND kind='task'").bind(task,team).first();if(!note||role!=='admin'&&note.assignee!==user)throw error('只能关联自己的任务',403);}else if(!category)throw error('非任务文件请选择归档分类');return {task,category:category||'任务文件'};}
