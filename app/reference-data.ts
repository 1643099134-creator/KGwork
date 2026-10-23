export const referenceCategories=['网站与展示平台','平台账号与会员','教学与测试平台','公司开票信息','合作单位资料','机密资料','待整理'];
export const referenceColors=['sage','sand','clay','lavender'];
export type ReferenceField={label:string;value:string;secret:boolean};
export function referenceCopyText(f:{title:string;url?:string;body?:string;fields:ReferenceField[]}){
 const body=f.body||'',title=body.split(/\r?\n/)[0].trim()===f.title.trim()?'':f.title;
 return [title,f.url,f.fields.filter(v=>v.value).map(v=>v.label+'：'+v.value).join('\n'),body].filter(Boolean).join('\n');
}
export function splitReferenceDrafts(text:string){
 const parts=text.split(/\n\s*[-－—=＝…。]{5,}[^\n]*\n/g).map(s=>s.trim()).filter(Boolean);
 return (parts.length?parts:[text.trim()]).filter(Boolean).map(body=>{
  const category=/机密|授权码|supabase|管理员后台/i.test(body)?'机密资料':/开票|税号|识别号|开户|银行账户/.test(body)?'公司开票信息':/测试号|学生|老师|课程|人才培养/.test(body)?'教学与测试平台':/账号|帐号|会员|密码|邮箱/.test(body)?'平台账号与会员':/https?:\/\//.test(body)?'网站与展示平台':'待整理';
  return {title:body.split('\n')[0].trim().slice(0,100)||'待整理资料',category,body,tags:'',url:'',fields:[],sensitive:false,visibility:'private',allowed:[],groups:[],denied:[],color:'sage'};
 });
}
