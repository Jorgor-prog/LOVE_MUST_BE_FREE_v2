'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Image from 'next/image';

export default function LoginPage(){
  const [loginId, setLogin] = useState('');
  const [password, setPass] = useState('');
  const [err, setErr] = useState<string|null>(null);

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setErr(null);
    try{
      const r = await fetch('/api/auth/login', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ loginId, password })
      });
      const j = await r.json();
      if(!r.ok){ setErr(j?.error || 'Login failed'); return; }
      if(j?.user?.role === 'ADMIN') window.location.href = '/admin';
      else window.location.href = '/dashboard';
    }catch{ setErr('Network error'); }
  }

  return (
    <div style={{
      minHeight:'100vh',
      display:'grid', placeItems:'center',
      backgroundImage:'url(/images/Background_1.webp)',
      backgroundSize:'cover', backgroundPosition:'center'
    }}>
      {/* большой щит по центру, не перехватывает клики */}
      <div style={{
        position:'fixed', left:'50%', top:'50%',
        transform:'translate(-50%,-50%)',
        pointerEvents:'none', zIndex:0
      }}>
        <Image src="/images/Logo_3.webp" alt="shield" width={900} height={900} style={{objectFit:'contain', opacity:0.9}}/>
      </div>

      <form onSubmit={submit} style={{
        position:'relative', zIndex:1,
        width:'min(92vw, 520px)',
        background:'rgba(17,24,39,0.82)', border:'1px solid #1f2937',
        borderRadius:14, padding:20, color:'#e5e7eb',
        boxShadow:'0 14px 34px rgba(0,0,0,.4)'
      }}>
        <div style={{fontSize:20, fontWeight:800, marginBottom:12, textAlign:'center'}}>Sign in</div>
        <input
          value={loginId} onChange={e=>setLogin(e.target.value)}
          placeholder="Login" className="input"
          style={{width:'100%', marginBottom:10, background:'#0b1220', border:'1px solid #1f2937',
                  color:'#e5e7eb', borderRadius:8, padding:'12px'}} />
        <input
          value={password} onChange={e=>setPass(e.target.value)} type="password"
          placeholder="Password" className="input"
          style={{width:'100%', marginBottom:12, background:'#0b1220', border:'1px solid #1f2937',
                  color:'#e5e7eb', borderRadius:8, padding:'12px'}} />
        {err && <div style={{marginBottom:10, color:'#fca5a5'}}>{err}</div>}
        <button className="btn" type="submit" style={{width:'100%', borderColor:'#38bdf8', color:'#38bdf8'}}>Login</button>
      </form>
    </div>
  );
}
