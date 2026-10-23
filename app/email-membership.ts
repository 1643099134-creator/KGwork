import {env} from 'cloudflare:workers';
// Called only after the email is verified by login, never from form input.
export async function claimEmailInvites(user:{userId:string;email:string;displayName:string}){
 if(!env.DB)return;const email=user.email.toLowerCase(),pending=await env.DB.prepare("SELECT team FROM email_team_invites WHERE email=? AND active=1 AND claimed='' LIMIT 30").bind(email).all<any>();
 if(!pending.results.length)return;
 for(const {team} of pending.results)await env.DB.batch([
  env.DB.prepare("INSERT OR IGNORE INTO members (team,user,name,email,role) SELECT team,?,?,email,role FROM email_team_invites WHERE team=? AND email=? AND active=1 AND claimed='' AND EXISTS(SELECT 1 FROM teams WHERE id=?)").bind(user.userId,user.displayName,team,email,team),
  env.DB.prepare("UPDATE email_team_invites SET claimed=? WHERE team=? AND email=? AND active=1 AND claimed='' AND EXISTS(SELECT 1 FROM members WHERE team=? AND user=? AND lower(email)=?)").bind(user.userId,team,email,team,user.userId,email)
 ]);
}
