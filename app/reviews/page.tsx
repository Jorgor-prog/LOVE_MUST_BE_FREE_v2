'use client';
import Image from 'next/image';
import { useEffect } from 'react';

export default function ReviewsPage(){
  useEffect(()=>{ document.body.style.background = '#0b1220'; return ()=>{ document.body.style.background=''; };},[]);
  return (
    <div style={{minHeight:'100vh', position:'relative', color:'#e5e7eb'}}>
      <Image src="/images/Background_1.webp" alt="" fill style={{objectFit:'cover', opacity:.3, filter:'blur(3%)'}}/>
      <div style={{position:'relative', zIndex:1, maxWidth:960, margin:'0 auto', padding:'20px 16px'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
          <a href="/dashboard" className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Back</a>
          <div style={{width:80}}/>
        </div>
        <h2>Reviews</h2>
        <div style={{opacity:.9}}>Огурцы как огурцы… текст вы потом замените.</div>
      </div>
    </div>
  );
}
