import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{team?:string}>}){const p=await searchParams;redirect('/tasks?list=mine'+(p.team?'&team='+encodeURIComponent(p.team):''));}
