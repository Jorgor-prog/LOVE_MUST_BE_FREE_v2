'use client';
export const dynamic = 'force-dynamic';

import UserTopBar from '@/components/UserTopBar';
import React from 'react';

export default function AboutPage(){
  const text = `We operate quietly and precisely. All services are already ordered and paid, your task is to clarify and confirm details.
Our model is simple and transparent, designed to reduce friction and keep you focused on outcomes.
Security and discretion are embedded in every step.
We streamline each interaction, minimize unnecessary steps, and verify only what truly matters so your time isn't wasted.
If something feels off, contact support — we respond quickly.
We believe in clear commitments, stable pacing, and a user experience that stays consistent across pages.
Expect reliability, measured speed, and a calm interface that stays readable in any light.`;

  return (
    <div style={{minHeight:'100vh', backgroundImage:'url(/images/Background_1.webp)', backgroundSize:'cover', backgroundPosition:'center'}}>
      <UserTopBar />
      <div style={{maxWidth:900, margin:'40px auto', background:'rgba(17,24,39,0.75)', color:'#e5e7eb', border:'1px solid #1f2937', borderRadius:14, padding:24, lineHeight:1.6}}>
        <h1 style={{marginTop:0, marginBottom:12}}>About</h1>
        <p style={{whiteSpace:'pre-wrap'}}>{text}</p>
      </div>
    </div>
  );
}
