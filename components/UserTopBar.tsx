'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

export default function UserTopBar({ compact=false }:{compact?:boolean}){
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(()=>{
    let stop=false;
    const check = async ()=>{
      try{
        const r = await fetch('/api/chat/inbox', { cache:'no-store' });
        const j = await r.json();
        const latestId = j?.latestId || 0;
        const lastSeen = Number(localStorage.getItem('user_last_seen_msg_id')||'0');
        if(!stop) setHasUnread(latestId>lastSeen);
      }catch{}
    };
    check();
    const id = setInterval(check, 8000);
    return ()=>{ stop=true; clearInterval(id); };
  },[]);

  async function logout(){
    await fetch('/api/auth/logout', { method:'POST' });
    window.location.href='/login';
  }

  return (
    <div style={{
      position:'sticky', top:0, zIndex:20,
      background:'rgba(10,14,23,0.62)', backdropFilter:'saturate(130%) blur(6px)',
      borderBottom:'1px solid rgba(31,41,55,0.9)'
    }}>
      <div style={{maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', gap:14, padding:'10px 12px'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <Image src="/images/Logo_3.webp" alt="logo" width={compact?54:72} height={compact?54:72} style={{objectFit:'contain'}}/>
          <span style={{fontWeight:800, color:'#e5e7eb'}}>LOVE MUST BE FREE</span>
        </div>

        <div style={{marginLeft:'auto', display:'flex', gap:10, flexWrap:'wrap'}}>
          <Link className="btn" href="/dashboard">Home</Link>
          <Link className="btn" href="/reviews">Reviews</Link>
          <Link className="btn" href="/about">About</Link>
          <Link className="btn" href="/chat" style={{position:'relative', borderColor:'#38bdf8', color:'#38bdf8'}}>
            Chat
            {hasUnread && <span style={{
              position:'absolute', top:-4, right:-6, width:10, height:10, borderRadius:'50%',
              background:'#ef4444', boxShadow:'0 0 0 2px rgba(10,14,23,0.62)'}}/>}
          </Link>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
