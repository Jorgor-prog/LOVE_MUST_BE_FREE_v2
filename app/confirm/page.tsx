'use client';
import Image from 'next/image';
import React, {useEffect, useRef, useState} from 'react';
import { useRouter } from 'next/navigation';

type Profile = { nameOnSite?:string; idOnSite?:string; residence?:string; photoUrl?:string };
type Me = { user?: { id:number; role:'USER'|'ADMIN'; profile?:Profile; codeConfig?:{ paused?:boolean; } } };

export default function ConfirmPage(){
  const router = useRouter();
  const [step,setStep]=useState(1);
  const [nameOnSite,setName]=useState('');
  const [idOnSite,setId]=useState('');
  const [residence,setRes]=useState('');
  const [matchedUser, setMatchedUser] = useState<{profile?:Profile} | null>(null);
  const [codeChars,setCodeChars]=useState<string>('');
  const [paused,setPaused]=useState(false);
  const evtRef = useRef<EventSource|null>(null);
  const [me, setMe] = useState<Me|null>(null);

  // фон
  useEffect(()=>{ document.body.style.background = '#0b1220'; return ()=>{ document.body.style.background=''; };},[]);
  // загрузить me и если человек уже дошёл до генерации — сразу на step 6
  useEffect(()=>{
    (async ()=>{
      const r = await fetch('/api/me');
      const j:Me = await r.json().catch(()=>({}));
      if(!j?.user){ router.push('/login'); return; }
      setMe(j);
      // если есть сохранённый прогресс — подтянуть
      const state = await fetch('/api/user/state').then(r=>r.json()).catch(()=>null);
      if(state?.lastStep>=6){ setStep(6); setPaused(!!state.paused); setCodeChars(state.currentText||''); }
    })();
  },[router]);

  useEffect(()=>()=>{ if(evtRef.current) evtRef.current.close(); },[]);

  // Автопауза при уходе со страницы
  useEffect(()=>{
    const pauseOnLeave = async ()=>{
      await fetch('/api/user/pause', { method:'POST' }).catch(()=>{});
    };
    window.addEventListener('beforeunload', pauseOnLeave);
    return ()=>{ window.removeEventListener('beforeunload', pauseOnLeave); };
  },[]);

  async function checkByIdOnly(){
    // ТОЛЬКО ID — сервер сам найдёт профиль по idOnSite
    const r = await fetch('/api/user/match-id', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ idOnSite })
    });
    const j = await r.json();
    if(j.ok && j.user){
      setMatchedUser(j.user);
      setStep(3);
    }else{
      setMatchedUser(null);
      setStep(3); // показываем «не совпало»
    }
  }

  function startStream(){
    if(evtRef.current) evtRef.current.close();
    const es = new EventSource('/api/code-stream');
    evtRef.current = es;
    es.onmessage = (e)=>{
      try{
        const data = JSON.parse(e.data);
        if(data.type==='char'){
          setCodeChars(prev=>prev + (prev ? ' ' + data.value + ' ' : data.value + ' ')); // пробелы вокруг символа
        }
        if(data.type==='done'){ es.close(); }
      }catch{}
    };
  }

  async function doPause(){
    await fetch('/api/user/pause', { method:'POST' });
    setPaused(true);
  }
  async function doStart(){
    await fetch('/api/user/start', { method:'POST' });
    setPaused(false);
  }

  return (
    <div style={{minHeight:'100vh', position:'relative', color:'#e5e7eb'}}>
      <Image src="/images/Background_1.webp" alt="" fill style={{objectFit:'cover', opacity:.25, filter:'blur(3px)'}} />
      <div style={{position:'relative', zIndex:1, padding:'24px 16px', maxWidth:980, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <a href="/dashboard" className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Back</a>
          <div style={{fontWeight:700}}>Confirm details</div>
          <div style={{width:80}}/>
        </div>

        <div style={{ background:'rgba(17,24,39,.88)', border:'1px solid #1f2937', borderRadius:12, padding:16 }}>
          {step===1 && (
            <div className="stack" style={{display:'grid', gap:10}}>
              <input className="input" placeholder="Your name on the website" value={nameOnSite} onChange={e=>setName(e.target.value)}
                     style={{background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:10, padding:'10px 12px'}} />
              <input className="input" placeholder="Your ID on the website" value={idOnSite} onChange={e=>setId(e.target.value)}
                     style={{background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:10, padding:'10px 12px'}} />
              <input className="input" placeholder="Place of residence indicated on the website" value={residence} onChange={e=>setRes(e.target.value)}
                     style={{background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:10, padding:'10px 12px'}} />

              <div style={{fontSize:12, color:'#cbd5e1', marginTop:2}}>
                The panda rabbit crocodile, di di di, eats candy, and could eat shashlik, but the elephant didn't come
              </div>

              <div style={{display:'flex', gap:8, marginTop:8}}>
                <button className="btn btn-primary" onClick={checkByIdOnly} style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Next</button>
              </div>
            </div>
          )}

          {step===3 && (
            <div>
              {matchedUser ? (
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
                  <div>
                    <div className="muted">Your name on the website</div>
                    <div>{matchedUser.profile?.nameOnSite||''}</div>
                    <div className="muted" style={{marginTop:10}}>Your ID on the website</div>
                    <div>{matchedUser.profile?.idOnSite||''}</div>
                    <div className="muted" style={{marginTop:10}}>Place of residence indicated on the website</div>
                    <div>{matchedUser.profile?.residence||''}</div>
                    <button className="btn btn-primary" onClick={()=>setStep(6)} style={{marginTop:12, borderColor:'#38bdf8', color:'#38bdf8'}}>
                      Confirm and continue
                    </button>
                  </div>
                  <div>
                    {matchedUser.profile?.photoUrl ? (
                      <img src={matchedUser.profile.photoUrl} alt="photo"
                           style={{ width:160, height:160, borderRadius:'50%', objectFit:'cover', border:'3px solid #fff',
                                    boxShadow:'0 0 10px rgba(0,0,0,0.2)' }} />
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="panel">The entered data does not match. Please contact support.</div>
              )}
            </div>
          )}

          {step===6 && (
            <div className="stack" style={{display:'grid', gap:12}}>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                <button className="btn btn-primary" onClick={startStream} style={{borderColor:'#38bdf8', color:'#38bdf8'}}>Generate code</button>
                <button className="btn" onClick={doPause} style={{borderColor:'#f59e0b', color:'#f59e0b'}}>Pause</button>
                <button className="btn" onClick={doStart} style={{borderColor:'#22c55e', color:'#22c55e'}}>Start</button>
              </div>

              {/* код с отступами между символами */}
              <div className="chatbox"
                   style={{whiteSpace:'pre-wrap', background:'#0f172a', border:'1px solid #1f2937', borderRadius:12, padding:12, minHeight:160, letterSpacing:'1px'}}>
                {codeChars || 'Waiting for code...'}
              </div>

              {/* Баннер паузы — НЕ исчезает, пока не нажмут Start */}
              {paused && (
                <div className="panel" style={{background:'#fffbeb', borderColor:'#fcd34d', color:'#1f2937'}}>
                  The pause is set for a maximum of 32 hours, after which the code will become invalid
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
