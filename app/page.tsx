'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';

export default function HomePage(){
  useEffect(()=>{ document.body.style.background = '#0b1220'; return ()=>{ document.body.style.background=''; };},[]);
  return (
    <div style={{minHeight:'100vh', position:'relative', display:'grid', placeItems:'center', color:'#e5e7eb'}}>
      <Image src="/images/Background_1.webp" alt="" fill priority style={{objectFit:'cover', opacity:.35, filter:'blur(3px)'}}/>
      <div style={{position:'relative', zIndex:1, textAlign:'center', padding:'24px', maxWidth:800}}>
        <h1 style={{fontSize:38, margin:0, letterSpacing:1}}>LOVE MUST BE FREE</h1>
        <p style={{margin:'18px 0 24px', fontSize:20, opacity:.9}}>
          All services are already ordered and paid
        </p>
        <Link href="/confirm" className="btn btn-primary" style={{padding:'10px 18px', borderRadius:12, border:'1px solid #38bdf8', color:'#38bdf8', textDecoration:'none'}}>
          Clarify and confirm details
        </Link>
      </div>
    </div>
  );
}
