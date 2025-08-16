'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Msg = { id:number; fromId:number; toId:number; text:string; createdAt:string };

export default function AdminChatWithUser(){
  const params = useParams(); // { id: '123' }
  const router = useRouter();
  const withId = Number(params?.id);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [meId, setMeId] = useState<number|undefined>(undefined);
  const boxRef = useRef<HTMLDivElement|null>(null);

  // Проверка роли + get me
  useEffect(()=>{
    (async ()=>{
      const me = await fetch('/api/me').then(r=>r.json()).catch(()=>null);
      if(me?.user?.role !== 'ADMIN'){ router.push('/dashboard'); return; }
      setMeId(me?.user?.id);
    })();
  },[router]);

  // Загрузка ленты
  async function load(){
    const r = await fetch(`/api/chat/thread?with=${withId}`);
    if(!r.ok) return;
    const j = await r.json();
    setMsgs(j.messages||[]);
    // скролл вниз
    setTimeout(()=>{ if(boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, 0);
    // отметить как прочитанные (индикатор)
    const last = j.messages?.[j.messages.length-1]?.id ?? 0;
    localStorage.setItem('chatLastSeenId_admin', String(last));
  }

  useEffect(()=>{ if(withId) { load(); const id=setInterval(load, 4000); return ()=>clearInterval(id); } }, [withId]);

  async function send(){
    const t = text.trim();
    if(!t) return;
    setText('');
    await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ toId: withId, text: t }) });
    await load();
  }

  return (
    <div style={{minHeight:'100vh', background:'#0b1220', color:'#e5e7eb'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'14px 16px', borderBottom:'1px solid #1f2937'}}>
        <button className="btn" onClick={()=>router.push('/admin')} style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Back to Admin</button>
        <div style={{fontWeight:700}}>Chat with user #{withId}</div>
        <div style={{marginLeft:'auto'}}>
          <button className="btn" onClick={()=>router.refresh()} style={{borderColor:'#334155', color:'#94a3b8'}}>Refresh</button>
        </div>
      </div>

      <div style={{maxWidth:900, margin:'0 auto', padding:16}}>
        <div ref={boxRef} style={{height:'62vh', overflow:'auto', border:'1px solid #1f2937', borderRadius:12, padding:12, background:'#0f172a'}}>
          {msgs.length===0 && <div style={{color:'#94a3b8'}}>No messages yet</div>}

          {msgs.map(m=>{
            const mine = m.fromId===meId;
            return (
              <div key={m.id} style={{display:'flex', justifyContent: mine?'flex-end':'flex-start', marginBottom:8}}>
                <div style={{
                  maxWidth:'72%',
                  background: mine ? '#1d4ed8' : '#334155',
                  color:'#e5e7eb',
                  borderRadius:12,
                  padding:'8px 10px',
                  whiteSpace:'pre-wrap'
                }}>
                  {m.text}
                  <div style={{fontSize:11, opacity:.7, marginTop:4}}>
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{display:'flex', gap:8, marginTop:12}}>
          <textarea
            value={text}
            onChange={e=>setText(e.target.value)}
            placeholder="Type a message…"
            className="input"
            style={{flex:1, minHeight:60, background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:10, padding:'10px 12px'}}
          />
          <button className="btn" onClick={send} style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Send</button>
        </div>
      </div>
    </div>
  );
}
