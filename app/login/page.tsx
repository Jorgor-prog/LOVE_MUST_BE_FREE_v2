'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function LoginPage(){
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    setErr(null); setLoading(true);
    try{
      const r = await fetch('/api/auth/login', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ loginId, password })
      });
      const j = await r.json();
      if(!r.ok){ setErr(j?.error || 'Login failed'); return; }
      window.location.href = j.redirect || '/dashboard';
    }catch(e:any){
      setErr('Network error');
    }finally{
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight:'100vh',
      display:'grid',
      placeItems:'center',
      backgroundImage:'url(/images/Background_1.webp)',
      backgroundSize:'cover',
      backgroundPosition:'center',
      position:'relative'
    }}>
      {/* Полупрозрачная плашка */}
      <div style={{
        position:'absolute', inset:0, background:'rgba(0,0,0,0.45)'
      }}/>

      {/* Щит по центру увеличенный */}
      <Image
        src="/images/Logo_3.webp"
        alt="shield"
        width={380} height={380}
        style={{
          position:'absolute',
          zIndex:1,
          opacity:0.25,
          filter:'drop-shadow(0 12px 30px rgba(0,0,0,.5))'
        }}
        priority
      />

      <form onSubmit={onSubmit} style={{
        position:'relative', zIndex:2,
        width:380, maxWidth:'92%',
        background:'rgba(17,24,39,0.65)',
        border:'1px solid rgba(255,255,255,0.08)',
        boxShadow:'0 20px 50px rgba(0,0,0,.45)',
        borderRadius:16, padding:20, color:'#e5e7eb', backdropFilter:'blur(6px)'
      }}>
        <div style={{fontSize:22, fontWeight:700, textAlign:'center', marginBottom:12}}>LOVE MUST BE FREE</div>
        <input
          className="input"
          placeholder="Login"
          value={loginId}
          onChange={e=>setLoginId(e.target.value)}
          style={{width:'100%', marginBottom:10, background:'#0b1220', border:'1px solid #1f2937', borderRadius:8, padding:'10px', color:'#e5e7eb'}}
        />
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          style={{width:'100%', marginBottom:10, background:'#0b1220', border:'1px solid #1f2937', borderRadius:8, padding:'10px', color:'#e5e7eb'}}
        />

        {err && <div style={{color:'#fecaca', marginBottom:8}}>{err}</div>}

        <button
          className="btn"
          disabled={loading || !loginId || !password}
          style={{width:'100%', borderColor:'#38bdf8', color:'#38bdf8'}}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
