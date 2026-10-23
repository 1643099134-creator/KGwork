export function fileAccess(item:any,user:string,role:string,userGroups:string[]){
 if(role==='admin'||item.owner===user)return true;
 const read=(s:string)=>{try{return JSON.parse(s)||[];}catch{return [];}};
 if(read(item.denied).includes(user))return false;
 if(item.visibility==='team')return true;
 if(item.visibility!=='custom')return false;
 return read(item.allowed).includes(user)||read(item.groups).some((id:string)=>userGroups.includes(id));
}
