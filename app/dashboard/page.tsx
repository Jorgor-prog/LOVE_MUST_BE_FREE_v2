'use client';
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { useEffect } from 'react';
import Link from 'next/link';
import UserTopBar from '@/components/UserTopBar';

export default function Dashboard(){
  useEffect(()=>{},[]);
  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)'}}>
      <UserTopBar />
      <div style={{maxWidth:1100, margin:'20px auto', padding:'0 12px'}}>
        <div style={{display:'flex', gap:14, flexWrap:'wrap'}}>
          <Link className="btn" href="/confirm" style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Clarify and confirm details</Link>
          <Link className="btn" href="/chat">Support chat</Link>
          <Link className="btn" href="/reviews">Reviews</Link>
          <Link className="btn" href="/about">About</Link>
        </div>
      </div>
    </div>
  );
}
