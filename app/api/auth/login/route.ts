import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { loginId, password } = await req.json();

    if (!loginId || !password) {
      return NextResponse.json({ error: 'Missing loginId or password' }, { status: 400 });
    }

    // Берём пользователя по логину
    const user = await prisma.user.findUnique({
      where: { loginId },
      select: {
        id: true,
        loginId: true,
        password: true,       // ХЭШ пароля
        role: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Ставим cookie-сессию
    const res = NextResponse.json({ ok: true, role: user.role });
    setAuthCookie(res, { id: user.id, role: user.role });
    return res;
  } catch (e) {
    console.error('LOGIN ERROR', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
