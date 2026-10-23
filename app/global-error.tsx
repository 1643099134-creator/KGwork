'use client';
export default function GlobalError(){return <html lang="zh-CN"><body style={{fontFamily:'sans-serif',padding:48,color:'#343b38',background:'#f5f3ef'}}><h1>工作空间连接暂时中断</h1><p>登录凭证仍保留在浏览器中，请重试连接。</p><button onClick={()=>window.location.reload()}>重试连接</button></body></html>;}
