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
          <p style={{opacity:.9, lineHeight:1.6}}>
            Наш проект создан с идеей напомнить каждому, что свобода — это не абстрактное слово, а реальная сила,
            которая объединяет людей. Мы стремимся создавать пространство, где каждый чувствует себя услышанным
            и уважаемым. Здесь нет лишних барьеров и формальностей — только искренность, открытость и желание
            идти навстречу. Мы верим, что в современном мире нужно не терять человечность, а наоборот — усиливать
            её простыми действиями. Наши пользователи становятся не просто участниками, а частью истории, где
            ценность личности стоит на первом месте. Каждый шаг здесь — это шаг в сторону честности и доверия.
            Поэтому мы продолжаем строить платформу, которая вдохновляет, объединяет и напоминает: свобода —
            это право, которым должен обладать каждый.
          </p>
        </div>
      </div>
    </div>
  );
}
