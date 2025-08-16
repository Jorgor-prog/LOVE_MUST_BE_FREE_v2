'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Msg = { id:number; fromId:number; toId:number; text:string; createdAt:string };
type Me  = { id:number; role:'USER'|'ADMIN' };

// заставляем страницу быть динамической (не пререндерить)
export const dynamic = 'force-dynamic';

function ChatInner(){
  const params = useSearchParams();
  const [me, setMe] = useState<Me|null>(null);
  const [peerId, setPeerId] = useState<number|null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    scrollRef.current?.scrollTo({ top: 999999, behavior:'smooth' });
  },[messages.length]);

  useEffect(()=>{
    (async ()=>{
      const meRes = await fetch('/api/me').then(r=>r.json()).catch(()=>null);
      const u = meRes?.user;
      if(!u){ window.location.href = '/login'; return; }
      setMe({ id:u.id, role:u.role });

      if(u.role === 'ADMIN'){
        const uid = Number(params.get('uid') || '0');
        if(!uid){ alert('Open chat from Admin panel for a specific user.'); return; }
        setPeerId(uid);
      }else{
        const r = await fetch('/api/chat/admin-id').then(x=>x.json()).catch(()=>null);
        if(!r?.id){ alert('Admin not found'); return; }
        setPeerId(r.id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{
    let stop=false;
    async function load(){
      if(!peerId) return;
      const r = await fetch(`/api/chat/thread?peerId=${peerId}`);
      const j = await r.json();
      if(!stop){
        setMessages(j.messages||[]);
        setLoading(false);

        if(j.messages?.length){
          const lastId = j.messages[j.messages.length-1].id;
          if(me?.role === 'ADMIN'){
            localStorage.setItem('chatLastSeenId_admin', String(lastId));
          }else{
            localStorage.setItem('user_last_seen_msg_id', String(lastId));
          }
        }
      }
    }
    load();
    const id = setInterval(load, 3000);
    return ()=>{ stop=true; clearInterval(id); };
  },[peerId, me?.role]);

  async function send(){
    if(!text.trim() || !peerId) return;
    const tt = text;
    setText('');
    await fetch('/api/chat/send', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ toId: peerId, text: tt })
    });
    const r = await fetch(`/api/chat/thread?peerId=${peerId}`);
    const j = await r.json();
    setMessages(j.messages||[]);
  }

  if(loading) return <div style={{padding:20, color:'#e5e7eb'}}>Loading chat…</div>;
  if(!peerId)  return <div style={{padding:20, color:'#e5e7eb'}}>Select user in Admin panel or contact support.</div>;

  return (
    <div style={{minHeight:'100vh', background:'#0b1220', color:'#e5e7eb', display:'flex', flexDirection:'column'}}>
      <div style={{padding:'10px 16px', borderBottom:'1px solid #1f2937', background:'#111827'}}>Support chat</div>

      <div ref={scrollRef} style={{flex:1, overflowY:'auto', padding:'16px'}}>
        {messages.map(m=>{
          const mine = m.fromId === me?.id;
          return (
            <div key={m.id} style={{display:'flex', justifyContent: mine?'flex-end':'flex-start', marginBottom:8}}>
              <div style={{
                maxWidth:'75%',
                background: mine ? '#0ea5e9' : '#1f2937',
                color: mine ? '#062a3a' : '#e5e7eb',
                padding:'8px 10px',
                borderRadius:12
              }}>
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{display:'flex', gap:8, padding:'10px 16px', borderTop:'1px solid #1f2937', background:'#111827'}}>
        <input className="input" value={text} onChange={e=>setText(e.target.value)}
               placeholder="Type a message…" style={{flex:1, background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}}/>
        <button className="btn" onClick={send} style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Send</button>
      </div>
    </div>
  );
}

export default function ChatPage(){
  return (
    <Suspense fallback={<div style={{padding:20, color:'#e5e7eb'}}>Loading…</div>}>
      <ChatInner/>
    </Suspense>
  );
}
