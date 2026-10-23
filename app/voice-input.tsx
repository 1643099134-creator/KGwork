'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Mic,Square,X} from 'lucide-react';

type Field=HTMLInputElement|HTMLTextAreaElement;
export default function VoiceInput(){
 const field=useRef<Field|null>(null),recognizer=useRef<any>(null),stop=useRef<()=>void>(()=>{});
 const [inlineHost,setInlineHost]=useState<HTMLElement|null>(null);const [position,setPosition]=useState<{top:number;left:number}|null>(null),[listening,setListening]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{
  const eligible=(el:Element|null):el is Field=>!!el&&(el instanceof HTMLTextAreaElement||el instanceof HTMLInputElement&&['text','search','email','tel','url'].includes(el.type))&&!(el as Field).readOnly&&!(el as Field).disabled;
  const locate=()=>{const el=field.current;if(!el||!el.isConnected||el.readOnly||el.disabled){stop.current();field.current=null;setPosition(null);setInlineHost(null);return;}const host=el.closest('.conversation-compose')?.querySelector<HTMLElement>('.conversation-voice-slot')||null;setInlineHost(host);const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight){setPosition(null);return;}const next={top:Math.min(innerHeight-58,Math.max(8,r.top-48)),left:Math.max(8,Math.min(innerWidth-235,r.right-220))};setPosition(old=>old?.top===next.top&&old?.left===next.left?old:next);};
  const focus=(e:FocusEvent)=>{if(eligible(e.target as Element)){if(field.current!==e.target){stop.current();setMessage('');}field.current=e.target as Field;locate();}else if((e.target as Element)?.closest?.('.conversation-compose')&&field.current?.closest('.conversation-compose')===(e.target as Element).closest('.conversation-compose')){stop.current();}else if(!(e.target as Element)?.closest?.('[data-voice-controls]')){stop.current();field.current=null;setPosition(null);setInlineHost(null);}};
  document.addEventListener('focusin',focus);window.addEventListener('resize',locate);document.addEventListener('scroll',locate,true);
  let frame=0;const observer=new MutationObserver(()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;locate();});});observer.observe(document.body,{childList:true,subtree:true});
  return()=>{recognizer.current?.abort();observer.disconnect();cancelAnimationFrame(frame);document.removeEventListener('focusin',focus);window.removeEventListener('resize',locate);document.removeEventListener('scroll',locate,true);};
 },[]);
 stop.current=()=>{recognizer.current?.abort();recognizer.current=null;setListening(false);};
 function start(){
  if(listening){recognizer.current?.stop();return;}
  const el=field.current;if(!el||el.disabled||el.readOnly)return;
  const Speech=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
  if(!Speech){setMessage('此浏览器不支持网页语音，请使用输入法的麦克风，或换用支持语音的浏览器。');return;}
  const r=new Speech();recognizer.current=r;r.lang='zh-CN';r.continuous=true;r.interimResults=true;
  let cursor=el.selectionStart??el.value.length,end=el.selectionEnd??cursor;
  setMessage('正在连接麦克风…');setListening(true);
  r.onstart=()=>{if(recognizer.current===r)setMessage('正在听，请说话；完成后点停止');};
  r.onresult=(event:any)=>{
   if(recognizer.current!==r||field.current!==el||!el.isConnected||el.readOnly||el.disabled)return;
   let final='',interim='';for(let i=event.resultIndex;i<event.results.length;i++){if(event.results[i].isFinal)final+=event.results[i][0].transcript;else interim+=event.results[i][0].transcript;}
   if(final){const value=el.value;cursor=Math.min(cursor,value.length);end=Math.min(end,value.length);const room=el.maxLength>=0?Math.max(0,el.maxLength-(value.length-(end-cursor))):Infinity;const inserted=final.slice(0,room);const next=value.slice(0,cursor)+inserted+value.slice(end);const proto=el instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value')!.set!.call(el,next);el.dispatchEvent(new Event('input',{bubbles:true}));cursor+=inserted.length;end=cursor;try{el.setSelectionRange(cursor,cursor);}catch{}setMessage(inserted.length<final.length?'已达到字数上限':'已转成文字，可修改后再提交');}
   else if(interim)setMessage(interim);
  };
  r.onerror=(e:any)=>{if(recognizer.current!==r)return;const messages:Record<string,string>={'not-allowed':'请在浏览器设置中允许麦克风权限。','service-not-allowed':'浏览器未开放语音服务，可使用输入法语音。','audio-capture':'没有检测到麦克风，请检查设备。','network':'语音服务连接失败，请重试或使用输入法语音。','no-speech':'没有听到说话，请重试。'};setMessage(messages[e.error]||'语音识别未完成，请重试。');setListening(false);};
  r.onend=()=>{if(recognizer.current===r){recognizer.current=null;setListening(false);setMessage(m=>m==='正在听，请说话；完成后点停止'||m==='正在连接麦克风…'?'语音已结束，可修改文字后再提交':m);}};
  try{r.start();}catch{recognizer.current=null;setListening(false);setMessage('无法启动语音，请重试或使用输入法语音。');}
 }
 const controls=<div data-voice-controls className={'voice-controls '+(listening?'listening ':'')+(inlineHost?'voice-controls-inline':'')} style={inlineHost?undefined:position||undefined} onMouseDown={e=>e.preventDefault()}><div><button type="button" onClick={start} aria-pressed={listening}>{listening?<Square size={15}/>:<Mic size={15}/>} {listening?'停止语音':'语音输入'}</button><button type="button" aria-label="关闭语音输入" onClick={()=>{stop.current();field.current=null;setPosition(null);setInlineHost(null);}}><X size={14}/></button></div>{message&&<p role="status">{message}</p>}</div>;return position?(inlineHost?createPortal(controls,inlineHost):controls):null;
}
