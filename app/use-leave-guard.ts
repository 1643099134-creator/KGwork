'use client';
import {useEffect} from 'react';
export default function useLeaveGuard(active:boolean){useEffect(()=>{if(!active)return;const check=(event:Event)=>{if(!confirm('当前修改还未保存，确定离开这个页面？'))event.preventDefault();};window.addEventListener('before-team-navigate',check);return()=>window.removeEventListener('before-team-navigate',check);},[active]);}
