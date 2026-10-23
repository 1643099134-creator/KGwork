'use client';
import Brand from './brand';
import {useState,useEffect} from 'react';
import {ArrowUpRight,Mail,KeyRound,StickyNote,CheckCheck} from 'lucide-react';
export default function EmailLogin({ready=false}:{ready?:boolean}){
 const [mode,setMode]=useState<'login'|'change'>('login');
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[current,setCurrent]=useState(''),[new1,setNew1]=useState(''),[new2,setNew2]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{
  let alive=true;
  (async()=>{try{const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'session'})}),j:any=await r.json();
   if(!alive)return;
   if(r.ok&&j.must_change){setMode('change');setEmail(j.email||'');setNotice('首次登录，请先设置你的新密码。');}
   else if(r.ok)window.location.assign('/');
  }catch{}}
 )();
  return()=>{alive=false;};
 },[]);
 async function post(body:Record<string,unknown>){const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),j:any=await r.json();if(!r.ok)throw new Error(j.error||'操作失败，请稍后重试');return j;}
 async function login(){setBusy(true);setError('');setNotice('');try{
  const j=await post({action:'login',email,password});
  if(j.must_change){setMode('change');setCurrent(password);setPassword('');setNotice('首次登录，请先设置你的新密码。');}
  else window.location.assign('/');
 }catch(e:any){setError(e.message);}finally{setBusy(false);}}
 async function change(){setBusy(true);setError('');setNotice('');try{
  if(new1!==new2)throw new Error('两次输入的新密码不一致');
  await post({action:'change',email,current,newPassword:new1});
  window.location.assign('/');
 }catch(e:any){setError(e.message);}finally{setBusy(false);}}
 return <main className="landing"><Brand/><div className="landing-content email-landing"><div className="eyebrow">KGWORK / CONNECT YOUR WORK</div><h1>一个工作台，<br/>连接全部工作。</h1><p>任务、项目、沟通与企业资料，在这里协同推进。<br/>使用管理员分配的账号，回到团队的共同空间。</p>
 {mode==='login'?<form className="email-form" onSubmit={e=>{e.preventDefault();login();}}>
  <label>邮箱地址<div><Mail size={17}/><input type="email" required autoComplete="email" maxLength={254} placeholder="输入你的邮箱" value={email} disabled={busy} onChange={e=>setEmail(e.target.value)}/></div></label>
  <label>密码<div><KeyRound size={17}/><input type="password" required autoComplete="current-password" maxLength={128} placeholder="输入初始密码" value={password} disabled={busy} onChange={e=>setPassword(e.target.value)}/></div></label>
  <button className="primary" disabled={!ready||busy}>{busy?'请稍候…':'登录工作台'}<ArrowUpRight size={17}/></button>
  {error&&<p className="error" role="alert">{error}</p>}
  {!ready&&<p className="login-notice">登录服务正在配置中，请稍后再试。</p>}
  <small>账号由管理员统一分配，首次登录后请及时修改密码。</small>
 </form>:<form className="email-form" onSubmit={e=>{e.preventDefault();change();}}>
  <label>邮箱<div><Mail size={17}/><input type="email" required autoComplete="email" maxLength={254} placeholder="你的邮箱" value={email} disabled onChange={e=>setEmail(e.target.value)}/></div></label>
  <label>当前密码<div><KeyRound size={17}/><input type="password" required autoComplete="current-password" maxLength={128} placeholder="输入当前密码" value={current} disabled={busy} onChange={e=>setCurrent(e.target.value)}/></div></label>
  <label>新密码<div><KeyRound size={17}/><input type="password" required autoComplete="new-password" minLength={6} maxLength={128} placeholder="至少 6 位" value={new1} disabled={busy} onChange={e=>setNew1(e.target.value)}/></div></label>
  <label>确认新密码<div><KeyRound size={17}/><input type="password" required autoComplete="new-password" minLength={6} maxLength={128} placeholder="再输入一次新密码" value={new2} disabled={busy} onChange={e=>setNew2(e.target.value)}/></div></label>
  <button className="primary" disabled={!ready||busy}>{busy?'请稍候…':'保存新密码并进入'}<ArrowUpRight size={17}/></button>
  {notice&&<p className="login-notice" role="status">{notice}</p>}
  {error&&<p className="error" role="alert">{error}</p>}
  <small>设置新密码后，用新密码登录工作台。</small>
 </form>}
 </div><div className="landing-notes"><div className="sample yellow"><Mail size={22}/><h2>安全登录，<br/>进入团队工作台。</h2><p>使用管理员分配的账号密码登录。</p></div><div className="sample green"><span>让协作简单一点</span><h3>记录 → 讨论 → 行动</h3><p>让任务有进度，让协作有结果。</p><CheckCheck/></div></div></main>;
}
