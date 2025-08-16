'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type Props = { compact?: boolean };

export default function UserTopBar({ compact }: Props){
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(()=>{
    let stop=false;
    async function check(){
      try{
        const r = await fetch('/api/chat/inbox');
        const j = await r.json();
        const latestId = j?.latestId || 0;
        const lastSeen = Number(localStorage.getItem('user_last_seen_msg_id')||'0');
        if(!stop) setHasUnread(latestId>lastSeen);
      }catch{}
    }
    check();
    const id = setInterval(check, 5000);
    return ()=>{ stop=true; clearInterval(id); };
  },[]);

  async function logout(){
    try{ await fetch('/api/auth/logout', { method:'POST' }); }catch{}
    window.location.href = '/login';
  }

  return (
    <div style={{
      position:'sticky', top:0, zIndex:20,
      backdropFilter:'saturate(130%) blur(6px)',
      background:'rgba(17,24,39,0.7)',
      borderBottom:'1px solid #1f2937'
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding: compact? '8px 14px' : '10px 18px'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <Image src="/images/Logo_2.webp" alt="logo" width={compact?40:56} height={compact?40:56} style={{borderRadius:'50%'}} />
          <div style={{fontWeight:800, letterSpacing:0.5, color:'#e5e7eb', fontSize: compact?18:22}}>LOVE MUST BE FREE</div>
        </div>
        <nav style={{display:'flex', alignItems:'center', gap:14}}>
          <Link href="/dashboard" style={{color:'#e5e7eb', opacity:1, textDecoration:'none'}}>Home</Link>
          <Link href="/about" style={{color:'#e5e7eb', opacity:1, textDecoration:'none'}}>About</Link>
          <Link href="/reviews" style={{color:'#e5e7eb', opacity:1, textDecoration:'none'}}>Reviews</Link>
          <Link href="/chat" style={{position:'relative', color:'#38bdf8', textDecoration:'none'}}>Chat
            {hasUnread && <span style={{position:'absolute', top:-4, right:-10, width:10, height:10, borderRadius:'50%', background:'#ef4444'}}/>}
          </Link>
          <button onClick={logout} className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Logout</button>
        </nav>
      </div>
    </div>
  );
}
