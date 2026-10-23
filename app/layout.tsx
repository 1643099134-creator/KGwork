import type { Metadata } from "next";
import "./globals.css";
import "./enterprise.css";
import "./client-portals.css";
import "./references.css";
import "./dashboard.css";
import "./members.css";
import "./project-documents.css";
import "./kgwork.css";
import "./workspace.css";
import NavAccess from './nav-access';
import ReviewNudge from './review-nudge';
import {getAppUser,authConfig} from './email-auth';
import {env} from 'cloudflare:workers';
import VoiceInput from "./voice-input";
import SessionGuard from './session-guard';
import ChatDrawer from './chat-drawer';

export const metadata: Metadata = {
  title: "KGwork 工作台 · 一站式团队协作",
  description: "任务、项目、沟通与企业资料，一个工作台连接全部工作。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user=await getAppUser();const roles=user&&env.DB?await env.DB.prepare('SELECT team,role FROM members WHERE user=? ORDER BY rowid').bind(user.userId).all<{team:string;role:string}>():{results:[]};
  return (
    <html lang="zh-CN">
      <body className="antialiased"><NavAccess roles={roles.results}>{authConfig()&&<SessionGuard authenticated={!!user}/>}{children}{user&&<ReviewNudge/>}<VoiceInput/>{user&&<ChatDrawer user={{id:user.userId,name:user.displayName,email:user.email}}/>}</NavAccess></body>
    </html>
  );
}

