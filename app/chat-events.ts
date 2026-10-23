'use client';
export function openChat(detail:{team:string;owner?:string;context?:string}){window.dispatchEvent(new CustomEvent('open-team-chat',{detail}));}
