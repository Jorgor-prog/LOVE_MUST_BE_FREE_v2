'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useRef, useState } from 'react';
import UserTopBar from '@/components/UserTopBar';

type Msg = { id:number; fromId:number; toId:number; text:string; createdAt:string };
type Me  = { id:number };

export default function UserChatPage(){
  const [me, setMe] = useState<Me|null>(null);
  const [adminId, setAdminId] = useState<number|0>(0);
  const [list, setList] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const boxRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    (async()=>{
      const r = await fetch('/api/me').then(x=>x.json()).catch(()=>null);
      if(!r?.user){ window.location.href='/login'; return; }
      setMe({ id: r.user.id });
      const a = await fetch('/api/chat/admin-id').then(x=>x.json()).catch(()=>({id:0}));
      setAdminId(a?.id || 0);
      load();
    })();
  },[]);

  useEffect(()=>{
    const id = setInterval(load, 4000);
    return ()=>clearInterval(id);
  },[me, adminId]);

  async function load(){
    if(!me || !adminId) return;
    const r = await fetch(`/api/chat/thread?peer=${adminId}`);
    const j = await r.json();
    setList(j?.messages || []);
    if(j?.latestId) localStorage.setItem('user_last_seen_msg_id', String(j.latestId));
    requestAnimationFrame(()=>{ if(boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; });
  }

  async function send(){
    if(!text.trim() || !adminId) return;
    await fetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ toId: adminId, body: text.trim() })
    });
    setText('');
    await load();
  }

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)'}}>
      <UserTopBar compact/>
      <div style={{maxWidth:900, margin:'20px auto', background:'rgba(17,24,39,0.8)', border:'1px solid #1f2937',
                   borderRadius:12, padding:12, color:'#e5e7eb'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
          <div style={{fontWeight:700}}>Support chat</div>
          <button className="btn" onClick={()=>window.history.back()} style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Back</button>
        </div>
        {!adminId && <div style={{color:'#fca5a5'}}>Admin not found</div>}
        <div ref={boxRef} style={{height:420, overflowY:'auto', background:'#0b1220', border:'1px solid #1f2937', borderRadius:8, padding:10}}>
          {list.map(m=>(
            <div key={m.id} style={{display:'flex', justifyContent: m.fromId===me?.id ? 'flex-end':'flex-start', margin:'6px 0'}}>
              <div style={{maxWidth:'70%', background: m.fromId===me?.id ? '#1e293b' : '#111827',
                           border:'1px solid #334155', borderRadius:10, padding:'8px 10px', whiteSpace:'pre-wrap'}}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div style={{display:'flex', gap:8, marginTop:8}}>
          <input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message…"
                 style={{flex:1, background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'10px'}} />
          <button className="btn" onClick={send} style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Send</button>
        </div>
      </div>
    </div>
  );
}
