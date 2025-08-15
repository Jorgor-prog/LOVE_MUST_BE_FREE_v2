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
    const r = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ loginId, password })});
    setLoading(false);
    if(!r.ok){ const j = await r.json().catch(()=>({})); setErr(j?.error||'Login failed'); return; }
    const me = await fetch('/api/me').then(x=>x.json()).catch(()=>null);
    const role = me?.user?.role;
    if(role === 'ADMIN') window.location.href = '/admin';
    else window.location.href = '/dashboard';
  }

  return (
    <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', background:'#0b1220' }}>
      <div style={{position:'relative'}}>
        <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', transform:'translate(-50%,-50%)', left:'50%', top:'50%', zIndex:0, opacity:.9 }}>
          <div style={{width:420, height:420, display:'grid', placeItems:'center'}}>
            <Image src="/images/Logo_1.webp" alt="logo" width={420} height={420} priority style={{objectFit:'contain', filter:'drop-shadow(0 12px 40px rgba(0,0,0,.45))'}} />
          </div>
        </div>
        <form onSubmit={submit} style={{ position:'relative', zIndex:1, width:360, background:'rgba(17,24,39,.92)', border:'1px solid #1f2937', borderRadius:14, padding:18, color:'#e5e7eb', boxShadow:'0 18px 40px rgba(0,0,0,.45)', backdropFilter:'blur(8px)' }}>
          <h2 style={{marginTop:0, textAlign:'center'}}>Sign in</h2>
          <input className="input" placeholder="Login" value={loginId} onChange={e=>setLoginId(e.target.value)} style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'8px 10px'}} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%', marginTop:8, background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'8px 10px'}} />
          {err && <div style={{marginTop:8, color:'#fca5a5'}}>{err}</div>}
          <button disabled={loading} className="btn btn-primary" style={{marginTop:12, width:'100%'}}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  );
}
