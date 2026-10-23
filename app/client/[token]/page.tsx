import ClientView from './view';
export const dynamic='force-dynamic';
export const metadata={title:'客户资料中心',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{token:string}>}){const {token}=await params;return <ClientView token={token}/>;}
