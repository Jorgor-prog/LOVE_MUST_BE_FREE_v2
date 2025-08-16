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
    if (!user) {
      return NextResponse.json({ error: 'Invalid login' }, { status: 401 });
    }

    // Проверка пароля:
    //  - ADMIN: сверяем bcrypt-хэш в passwordHash
    //  - USER : сверяем с loginPassword в открытом виде
    let ok = false;

    if (user.role === 'ADMIN') {
      if (!user.passwordHash) {
        return NextResponse.json({ error: 'Admin password not set' }, { status: 500 });
      }
      ok = await bcrypt.compare(password, user.passwordHash);
    } else {
      ok = !!user.loginPassword && password === user.loginPassword;
    }

    if (!ok) {
      return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
    }

    const token = signToken({ uid: user.id, role: user.role });
    const res = NextResponse.json({
      ok: true,
      role: user.role,
      redirect: user.role === 'ADMIN' ? '/admin' : '/dashboard'
    });
    setAuthCookie(res, token);
    return res;
  } catch (e) {
    console.error('Login error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
