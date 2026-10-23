'use client';
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){return <main className="empty" role="alert"><h1>暂时连接不上工作空间</h1><p>可能是网络或服务短暂波动。请重试，无需因此退出账号。</p><button className="primary" onClick={reset}>重试连接</button></main>;}
