'use client';
export const dynamic = 'force-dynamic';

import UserTopBar from '@/components/UserTopBar';
import React from 'react';

const REVIEWS = [
  "Хруст огурцов идеальный, соль не перебор, укроп как надо — закусь, которую не стыдно подать даже капризному гостю.",
  "Слегка кислит, но в этом шарм — такой баланс делает вкус запоминающимся. В банку руку тянет сама.",
  "Уверенный солёный профиль без лишней резкости, чеснок даёт аромат, а не забивает всё вокруг.",
  "Хороши и с картошкой, и в одиночку. Сок не мутный, специи на дне аккуратно, без мусора.",
  "Если любишь настоящие солёные огурцы, а не сладкие маринады, — это попадание в десятку.",
  "Ни кожи-бронежилета, ни ватной мякоти — текстура ровная, упругая, как и должна быть.",
  "Единственный минус — заканчиваются быстрее, чем планируешь. Но это приятная проблема."
];

export default function ReviewsPage(){
  return (
    <div style={{minHeight:'100vh', backgroundImage:'url(/images/Background_1.webp)', backgroundSize:'cover', backgroundPosition:'center'}}>
      <UserTopBar />
      <div style={{maxWidth:900, margin:'40px auto', display:'grid', gap:14}}>
        {REVIEWS.map((t, i)=>(
          <div key={i} style={{background:'rgba(17,24,39,0.75)', color:'#e5e7eb', border:'1px solid #1f2937', borderRadius:12, padding:16}}>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
