export const dynamic = 'force-dynamic';
'use client';
import Image from 'next/image';
import { useEffect } from 'react';
import UserNav from '@/components/UserNav';

export default function ReviewsPage(){
  useEffect(()=>{ document.body.style.background = '#0b1220'; return ()=>{ document.body.style.background=''; };},[]);
  return (
    <div style={{minHeight:'100vh', position:'relative', color:'#e5e7eb'}}>
      <Image src="/images/Background_1.webp" alt="" fill style={{objectFit:'cover', opacity:.3, filter:'blur(3px)'}}/>
      <div style={{position:'relative', zIndex:1}}>
        <UserNav/>
        <div style={{maxWidth:960, margin:'0 auto', padding:'20px 16px'}}>
          <a href="/dashboard" className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Back</a>
          <h2 style={{marginTop:16}}>Reviews</h2>
          <div style={{marginTop:20, display:'grid', gap:16}}>
            <div style={{padding:12, border:'1px solid #38bdf8', borderRadius:8}}>
              Никогда не думал, что огурцы могут быть вдохновением для жизни. Но здесь они именно такие!
            </div>
            <div style={{padding:12, border:'1px solid #38bdf8', borderRadius:8}}>
              Хрустящий опыт! Эти огурцы напомнили мне, что свежесть — это не просто вкус, а состояние души.
            </div>
            <div style={{padding:12, border:'1px solid #38bdf8', borderRadius:8}}>
              Огурцы здесь не простые, они как будто прошли школу харизмы. Приятно удивлён.
            </div>
            <div style={{padding:12, border:'1px solid #38bdf8', borderRadius:8}}>
              Если бы можно было поставить десять звёзд за огурцы, я бы поставил все двадцать!
            </div>
            <div style={{padding:12, border:'1px solid #38bdf8', borderRadius:8}}>
              Секрет счастья прост: ешь огурцы и улыбайся. Здесь об этом знают точно!
            </div>
            <div style={{padding:12, border:'1px solid #38bdf8', borderRadius:8}}>
              Мне кажется, что эти огурцы могут даже вдохновить написать книгу. Или хотя бы стихотворение.
            </div>
            <div style={{padding:12, border:'1px solid #38bdf8', borderRadius:8}}>
              Отличный вкус и послевкусие свободы. Огурцы — наше всё!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
