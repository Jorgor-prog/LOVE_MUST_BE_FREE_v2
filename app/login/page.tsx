'use client';
import React, { useState } from 'react';
import Image from 'next/image';

export default function LoginPage(){
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setErr(null); setLoading(true);
    const r = await fetch('/api/auth/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ loginId, password })
    });
    setLoading(false);
    if(!r.ok){
      const j = await r.json().catch(()=>({}));
      setErr(j?.error||'Login failed');
      return;
    }
    const me = await fetch('/api/me').then(x=>x.json()).catch(()=>null);
    const role = me?.user?.role;
    if(role === 'ADMIN') window.location.href = '/admin';
    else window.location.href = '/dashboard';
  }

  return (
    <div style={{
      minHeight:'100vh',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      background:'#0b1220',
      position:'relative',
      overflow:'hidden'
    }}>
      {/* БОЛЬШОЕ ЛОГО-ЩИТ ЗА ФОРМОЙ */}
      <svg
        aria-hidden
        width="0" height="0" style={{position:'absolute'}}
      >
        <defs>
          <clipPath id="shield" clipPathUnits="objectBoundingBox">
            {/* Щит: верх круглый, низ острый */}
            <path d="
              M 0.5,0
              C 0.78,0.0 1.0,0.12 1.0,0.35
              C 1.0,0.58 0.85,0.78 0.67,0.92
              C 0.55,1.0 0.45,1.0 0.33,0.92
              C 0.15,0.78 0.0,0.58 0.0,0.35
              C 0.0,0.12 0.22,0.0 0.5,0.0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div
        aria-hidden
        style={{
          position:'absolute',
          left:'50%',
          top:'50%',
          transform:'translate(-50%,-50%)',
          width:'min(62vw, 560px)',
          height:'min(62vw, 560px)',
          clipPath:'url(#shield)',
          opacity:0.98,
          filter:'drop-shadow(0 28px 60px rgba(0,0,0,.55))',
          pointerEvents:'none',
          zIndex:0
        }}
      >
        <Image
          src="/images/Logo_1.webp"
          alt=""
          fill
          priority
          style={{objectFit:'cover'}}
        />
      </div>

      {/* Форма логина по центру */}
      <form
        onSubmit={submit}
        style={{
          position:'relative',
          zIndex:1,
          width:'min(92vw, 420px)',
          background:'rgba(17,24,39,.92)',
          border:'1px solid #1f2937',
          borderRadius:16,
          padding:22,
          color:'#e5e7eb',
          boxShadow:'0 18px 40px rgba(0,0,0,.45)',
          backdropFilter:'blur(8px)'
        }}
      >
        <h2 style={{marginTop:0, textAlign:'center'}}>Sign in</h2>

        <input
          className="input"
          placeholder="Login"
          value={loginId}
          onChange={e=>setLoginId(e.target.value)}
          style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:10, padding:'10px 12px'}}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          style={{width:'100%', marginTop:10, background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:10, padding:'10px 12px'}}
        />

        {err && <div style={{marginTop:10, color:'#fca5a5'}}>{err}</div>}

        <button disabled={loading} className="btn btn-primary" style={{marginTop:14, width:'100%'}}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
