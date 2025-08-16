// app/dashboard/page.tsx
'use client';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Dashboard(){
  useEffect(()=>{ document.body.style.background = '#0b1220'; return ()=>{ document.body.style.background=''; };},[]);
  return (
    <div style={{minHeight:'100vh', color:'#e5e7eb', padding:'20px 16px'}}>
      <h1 style={{marginTop:0}}>Dashboard</h1>
      <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
        <Link href="/confirm" className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8', textDecoration:'none'}}>
          Clarify and confirm details
        </Link>
        <Link href="/chat" className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8', textDecoration:'none'}}>
          Support chat
        </Link>
        <Link href="/reviews" className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8', textDecoration:'none'}}>
          Reviews
        </Link>
        <Link href="/about" className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8', textDecoration:'none'}}>
          About
        </Link>
      </div>
    </div>
  );
}
