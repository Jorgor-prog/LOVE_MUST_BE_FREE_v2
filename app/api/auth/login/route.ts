export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { loginId, password } = await req.json();

    if (!loginId || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { loginId } });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    let ok = false;

    // 1) Если есть хеш — проверяем его
    if (user.passwordHash) {
      ok = await bcrypt.compare(password, user.passwordHash);
    }

    // 2) Если не подошло — допускаем совпадение с loginPassword (видимый пароль)
    if (!ok && user.loginPassword) {
      ok = password === user.loginPassword;
    }

    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signToken({ uid: user.id, role: user.role });
    const res = NextResponse.json({ ok: true, role: user.role });

    setAuthCookie(res, token);
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
