'use client';
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import UserTopBar from '@/components/UserNav';

const R = [
  'Огурцы топ, хрустят и солятся как надо. Пахнут летом и огородом.',
  'Хруст идеальный, лодочки для бутеров получаются шикарные.',
  'Чуть соли, чуть уксуса, и уже праздник. Претензий нет.',
  'Семечки почти не чувствуются, текстура ровная, приятно есть.',
  'Ели всей компанией, все остались довольны, беру еще.',
  'Маринад нежный, без резкости, но не пресный. Отличный баланс.',
  'Если любишь соленые огурцы, это то, что надо. Рекомендую.'
];

export default function ReviewsPage(){
  useEffect(()=>{},[]);
  return (
    <div style={{minHeight:'100vh', backgroundImage:'url(/images/Background_1.webp)', backgroundSize:'cover', backgroundPosition:'center'}}>
      <UserTopBar />
      <div style={{maxWidth:900, margin:'20px auto', color:'#e5e7eb', padding:'0 12px'}}>
        <h2>Reviews</h2>
        <div style={{display:'grid', gap:10}}>
          {R.map((t,i)=>(
            <div key={i} style={{background:'rgba(17,24,39,0.85)', border:'1px solid #1f2937', borderRadius:10, padding:12}}>
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
