'use client';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

export default function UserTopBar(){
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(()=>{
    let stop = false;
    const tick = async ()=>{
      try{
        const r = await fetch('/api/chat/thread-user?head=1');
        const j = await r.json();
        // если последний месседж от админа — показываем точку
        setHasUnread(j?.latest && j.latest.fromRole === 'ADMIN');
      }catch{}
    };
    tick();
    const id = setInterval(tick, 5000);
    return ()=>{ stop = true; clearInterval(id); };
  },[]);

  return (
    <div style={{
      position:'sticky', top:0, zIndex:50,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'10px 16px',
      background:'rgba(17,24,39,0.75)',
      backdropFilter:'blur(6px) saturate(120%)',
      borderBottom:'1px solid #1f2937'
    }}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <div style={{position:'relative', width:42, height:42}}>
          <Image src="/images/Logo_3.webp" alt="logo" fill style={{objectFit:'contain', borderRadius:'50%'}}/>
        </div>
        <div style={{fontWeight:800, letterSpacing:.5, color:'#e5e7eb'}}>LOVE MUST BE FREE</div>
      </div>

      <nav style={{display:'flex', gap:10}}>
        <Link href="/dashboard" className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8', textDecoration:'none'}}>Home</Link>
        <Link href="/confirm" className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8', textDecoration:'none'}}>Confirm</Link>
        <Link href="/reviews" className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8', textDecoration:'none'}}>Reviews</Link>
        <Link href="/about" className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8', textDecoration:'none'}}>About</Link>

        <Link href="/chat" className="btn" style={{position:'relative', borderColor:'#38bdf8', color:'#38bdf8', textDecoration:'none'}}>
          Chat
          {hasUnread && (
            <span style={{
              position:'absolute', top:-3, right:-6, width:10, height:10,
              borderRadius:'50%', background:'#ef4444', boxShadow:'0 0 0 2px rgba(17,24,39,.75)'
            }}/>
          )}
        </Link>

        <a href="/api/auth/logout" className="btn" style={{borderColor:'#f87171', color:'#f87171', textDecoration:'none'}}>Logout</a>
      </nav>
    </div>
  );
}
