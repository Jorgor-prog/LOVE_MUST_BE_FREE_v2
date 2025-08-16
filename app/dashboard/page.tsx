'use client';
import Image from 'next/image';
import { useEffect } from 'react';
import UserTopBar from '@/components/UserTopBar';
import Link from 'next/link';

export default function Dashboard(){
  useEffect(()=>{ document.body.style.background = '#0b1220'; return ()=>{ document.body.style.background=''; };},[]);
  return (
    <div style={{minHeight:'100vh', position:'relative', color:'#e5e7eb'}}>
      <Image src="/images/Background_1.webp" alt="" fill style={{objectFit:'cover', opacity:.28, filter:'blur(3px)'}}/>
      <div style={{position:'relative', zIndex:1}}>
        <UserTopBar/>

        <div style={{maxWidth:980, margin:'0 auto', padding:'24px 16px'}}>
          <div style={{
            background:'rgba(17,24,39,.85)',
            border:'1px solid #1f2937',
            borderRadius:14,
            padding:'22px',
            boxShadow:'0 10px 30px rgba(0,0,0,.35)'
          }}>
            <h1 style={{margin:'0 0 10px 0', fontSize:28, letterSpacing:.3}}>All services are already ordered and paid</h1>
            <div style={{opacity:.92, lineHeight:1.6, marginBottom:16}}>
              You only need to clarify the details of the order so we can proceed correctly.
            </div>
            <Link href="/confirm" className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8', textDecoration:'none'}}>
              Clarify and confirm details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
