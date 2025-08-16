'use client';
import Image from 'next/image';
import { useEffect } from 'react';
import UserNav from '@/components/UserNav';

export default function AboutPage(){
  useEffect(()=>{ document.body.style.background = '#0b1220'; return ()=>{ document.body.style.background=''; };},[]);
  return (
    <div style={{minHeight:'100vh', position:'relative', color:'#e5e7eb'}}>
      <Image src="/images/Background_1.webp" alt="" fill style={{objectFit:'cover', opacity:.3, filter:'blur(3px)'}}/>
      <div style={{position:'relative', zIndex:1}}>
        <UserNav/>
        <div style={{maxWidth:960, margin:'0 auto', padding:'20px 16px'}}>
          <a href="/dashboard" className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Back</a>
          <h2 style={{marginTop:16}}>About project</h2>
          <p style={{opacity:.9}}>Твой текст про проект. Можешь заменить потом.</p>
        </div>
      </div>
    </div>
  );
}
