import {member,db,error} from './task-service';
import {fileAccess} from './library-access';
export async function projectFileScope(team:string,project:string,user:string){const d=db(),m=await member(team,user),p=await d.prepare('SELECT * FROM project_spaces WHERE id=? AND team=?').bind(project,team).first<any>();if(!p)throw error('项目不存在',404);if(m.role!=='admin'&&!await d.prepare('SELECT user FROM project_members WHERE project=? AND user=?').bind(project,user).first())throw error('只有项目成员可以查看项目文件',403);return {d,m,project:p};}
export const fileKey=(f:any)=>(f.taskSource?'task':'library')+':'+f.id;
export async function projectFileIndex(d:any,team:string,user:string,role:string,project=''){
 const [people,pm,lib,tasks,metas,groups,grants,trash]=await d.batch([
 d.prepare('SELECT user,name,role FROM members WHERE team=?').bind(team),
 d.prepare('SELECT pm.project,pm.user FROM project_members pm JOIN project_spaces p ON p.id=pm.project WHERE p.team=?').bind(team),
 d.prepare("SELECT DISTINCT pf.project,li.* FROM project_files pf JOIN project_spaces p ON p.id=pf.project JOIN library_items li ON li.id=pf.item AND li.team=p.team WHERE p.team=? AND pf.source='library' AND (?='' OR p.id=?)").bind(team,project,project),
 d.prepare("SELECT DISTINCT p.id AS project,td.*,n.title AS taskTitle,n.assignee AS taskAssignee,n.kind AS noteKind FROM project_spaces p JOIN task_deliverables td ON td.team=p.team JOIN notes n ON n.id=td.note AND n.team=td.team WHERE p.team=? AND (?='' OR p.id=?) AND (EXISTS(SELECT 1 FROM project_files pf WHERE pf.project=p.id AND pf.item=td.id AND pf.source='task') OR EXISTS(SELECT 1 FROM project_nodes pn WHERE pn.project=p.id AND pn.task=td.note))").bind(team,project,project),
 d.prepare("SELECT fm.* FROM project_file_meta fm JOIN project_spaces p ON p.id=fm.project WHERE p.team=? AND (?='' OR p.id=?)").bind(team,project,project),
 d.prepare('SELECT group_id,user FROM library_group_members WHERE team=?').bind(team),
 d.prepare('SELECT owner,viewer FROM list_permissions WHERE team=?').bind(team),
 d.prepare('SELECT item,source FROM library_trash WHERE team=?').bind(team)]);
 const members:any[]=people.results,metainfo:any[]=metas.results,projectPeople=(p:string)=>members.filter(x=>x.role==='admin'||pm.results.some((m:any)=>m.project===p&&m.user===x.user));
 const items:any[]=[];
 for(const row of [...lib.results.map((f:any)=>({...f,taskSource:false})),...tasks.results.map((f:any)=>({...f,taskSource:true}))]){
  const source=row.taskSource?'task':'library',can=(p:any)=>row.taskSource?(row.noteKind!=='task'||p.role==='admin'||p.user===row.taskAssignee||grants.results.some((g:any)=>g.owner===row.taskAssignee&&g.viewer===p.user)):fileAccess(row,p.user,p.role,groups.results.filter((g:any)=>g.user===p.user).map((g:any)=>g.group_id));
  if(trash.results.some((x:any)=>x.item===row.id&&x.source===source)||!projectPeople(row.project).some(p=>p.user===user)||!can({user,role}))continue;
  const {object_key,allowed,denied,groups:rawGroups,...file}=row;
  const stored=metainfo.find(x=>x.project===row.project&&x.item===row.id&&x.source===source),isResult=row.taskSource&&row.purpose!=='material';
  const meta=stored||{category:isResult?'反馈成果':row.category||'任务资料',series:row.name,revision:0,purpose:isResult?'result':'material',status:isResult?'review':'original',submitter:row.taskSource?row.taskAssignee:row.owner,reviewer:'',note:'',feedback:'',submitted:row.created,reviewed:0,reviewed_by:'',version:0,opened:0,opened_by:'',review_due:row.created+86400000,snooze:0,updated:row.created};
  const visibleUsers=projectPeople(row.project).filter(can).map(p=>p.user),canReview=meta.status==='review'&&(role==='admin'||meta.reviewer===user),canEdit=role!=='viewer'&&(role==='admin'||meta.submitter===user||(!stored&&(row.taskSource?row.taskAssignee:row.owner)===user));
  const receipt=meta.status!=='review'?'':meta.snooze>Date.now()?'later':!meta.opened?'unopened':'opened';
  items.push({...file,receipt,source,key:source+':'+row.id,visibleUsers,meta,canReview,canEdit,ownerName:row.author||members.find(p=>p.user===row.owner)?.name||'原上传者',auto:row.taskSource&&!stored});
 }
 // Versions are persisted once managed; legacy task attachments get a deterministic fallback label.
 for(const f of items){if(!f.meta.revision){const siblings=items.filter(x=>x.project===f.project&&x.meta.series===f.meta.series).sort((a,b)=>(a.meta.submitted||a.created)-(b.meta.submitted||b.created)||a.id.localeCompare(b.id));f.meta={...f.meta,revision:siblings.findIndex(x=>x.key===f.key)+1};}}
 return {items,members};
}
export async function projectReviewCounts(d:any,team:string,user:string,role:string){const {items}=await projectFileIndex(d,team,user,role);const counts:Record<string,number>={};for(const f of items)if(f.canReview)counts[f.project]=(counts[f.project]||0)+1;return counts;}
