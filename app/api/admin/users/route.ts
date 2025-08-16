import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

function generatePassword(len = 12) {
  const lower = 'abcdefghjkmnpqrstuvwxyz'; // без легко путаемых
  const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const nums  = '23456789';
  const symb  = '!@#$%^&*';
  const all   = lower + upper + nums + symb;

  // гарантируем наличие каждого класса
  let pwd = '';
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += nums[Math.floor(Math.random() * nums.length)];
  pwd += symb[Math.floor(Math.random() * symb.length)];
  for (let i = pwd.length; i < len; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  // простая перетасовка
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

async function generateUniqueLoginId() {
  // простой вариант: u + timestamp, при коллизии — добавляем рандом
  let base = 'user' + Math.floor(Date.now() / 1000);
  let loginId = base;
  let attempt = 0;
  while (true) {
    const exists = await prisma.user.findUnique({ where: { loginId } });
    if (!exists) return loginId;
    attempt++;
    loginId = `${base}_${attempt}`;
  }
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    orderBy: { id: 'desc' },
    select: {
      id: true,
      loginId: true,
      adminNoteName: true,
      isOnline: true,
      updatedAt: true,
      profile: {
        select: { nameOnSite: true, idOnSite: true, residence: true, photoUrl: true }
      },
      codeConfig: {
        select: { code: true, emitIntervalSec: true, paused: true }
      }
    }
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const adminNoteName = typeof body?.adminNoteName === 'string' ? body.adminNoteName.trim() : '';

  const loginId = await generateUniqueLoginId();
  const password = generatePassword(12);

  const user = await prisma.user.create({
    data: {
      loginId,
      role: 'USER',
      loginPassword: password, // сохраняем в открытом виде как и планировалось
      adminNoteName,
      profile: {
        create: {}
      },
      codeConfig: {
        create: { code: '', emitIntervalSec: 22, paused: false }
      }
    },
    select: {
      id: true,
      loginId: true,
      adminNoteName: true,
      profile: { select: { nameOnSite: true, idOnSite: true, residence: true, photoUrl: true } },
      codeConfig: { select: { code: true, emitIntervalSec: true, paused: true } }
    }
  });

  // важно: возвращаем пароль отдельным полем
  return NextResponse.json({ user: { ...user, password } });
}
