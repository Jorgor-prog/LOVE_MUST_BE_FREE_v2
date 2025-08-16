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
    <div style={{minHeight:'100vh', display:'grid', placeItems:'center',
      backgroundImage:'url(/images/Background_1.webp)', backgroundSize:'cover', backgroundPosition:'center'}}>
      <div style={{position:'relative', width:'min(92vw, 420px)'}}>
        {/* Щит без искажения и без перехвата кликов */}
        <div style={{
          position:'absolute', inset:0, display:'grid', placeItems:'center',
          transform:'translateY(-50%)', pointerEvents:'none', zIndex:0
        }}>
          <Image src="/images/Logo_3.webp" alt="logo-shield" width={440} height={440}
                 style={{objectFit:'contain', opacity:0.8}} />
        </div>

        <form onSubmit={submit} style={{
          position:'relative', zIndex:1,
          background:'rgba(17,24,39,0.78)', border:'1px solid #1f2937',
          borderRadius:14, padding:18, color:'#e5e7eb', boxShadow:'0 10px 30px rgba(0,0,0,.35)'}}>
          <div style={{fontSize:18, fontWeight:700, marginBottom:10, textAlign:'center'}}>Sign in</div>
          <input value={loginId} onChange={e=>setLogin(e.target.value)} placeholder="Login" className="input"
            style={{width:'100%', marginBottom:10, background:'#0b1220', border:'1px solid #1f2937',
                    color:'#e5e7eb', borderRadius:8, padding:'10px'}} />
          <input value={password} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" className="input"
            style={{width:'100%', marginBottom:12, background:'#0b1220', border:'1px solid #1f2937',
                    color:'#e5e7eb', borderRadius:8, padding:'10px'}} />
          {err && <div style={{marginBottom:10, color:'#fca5a5'}}>{err}</div>}
          <button className="btn" type="submit" style={{width:'100%', borderColor:'#38bdf8', color:'#38bdf8'}}>Login</button>
        </form>
      </div>
    </div>
  );
}
