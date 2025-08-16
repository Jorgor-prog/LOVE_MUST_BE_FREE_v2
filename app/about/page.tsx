'use client';
export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { useEffect } from 'react';
import UserTopBar from '@/components/UserNav';

export default function AboutPage(){
  useEffect(()=>{},[]);
  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#0b1220,#0f172a)'}}>
      <UserTopBar />
      <div style={{maxWidth:900, margin:'20px auto', color:'#e5e7eb', padding:'0 12px'}}>
        <h2>About</h2>
        <p style={{opacity:.9}}>
          Здесь 600 символов заглушки про проект, чтобы было видно верстку и отступы. 
          Мы делаем сервис, в котором все услуги уже заказаны и оплачены, 
          пользователю остается просто уточнить детали, подтвердить параметры и 
          получить свой код. Дальше мы гарантируем прозрачность взаимодействия и поддержку. 
          Система построена так, чтобы каждая мелочь была очевидной и простой, 
          а любые вопросы решались через быстрый и понятный чат с администратором.
        </p>
      </div>
    </div>
  );
}
