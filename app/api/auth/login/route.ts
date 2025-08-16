import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { loginId, password } = await req.json();
    if (!loginId || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { loginId },
      select: { id: true, role: true, loginPassword: true, passwordHash: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    let ok = false;
    if (user.passwordHash) {
      ok = await bcrypt.compare(password, user.passwordHash);
    } else if (user.loginPassword) {
      ok = password === user.loginPassword;
    }

    if (!ok) {
      return NextResponse.json({ error: 'Invalid login or password' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true, user: { id: user.id, role: user.role } });
    // простые куки-сессии (достаточно для Render free)
    res.cookies.set('uid', String(user.id), { httpOnly: true, path: '/', sameSite: 'lax' });
    res.cookies.set('role', user.role, { httpOnly: true, path: '/', sameSite: 'lax' });
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
