// The session token lives in an HttpOnly cookie; it is a random value stored in D1.
export const SESSION_DAYS=30;
export function saveSession(jar:any,token:string,secure:boolean){
 jar.set('bn_access',token,{httpOnly:true,secure,sameSite:'lax' as const,path:'/',maxAge:SESSION_DAYS*86400});
}
export function clearSession(jar:any){jar.delete('bn_access');jar.delete('bn_refresh');}
