// app/api/auth/login/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { loginId, password } = await req.json();
    if (!loginId || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { loginId } });
    if (!user) return NextResponse.json({ error: 'Invalid login' }, { status: 401 });

    let ok = false;
    if (user.role === 'ADMIN') {
      ok = !!user.passwordHash && await bcrypt.compare(password, user.passwordHash);
    } else {
      ok = user.loginPassword === password;
    }
    if (!ok) return NextResponse.json({ error: 'Invalid password' }, { status: 401 });

    const token = signSession({ uid: user.id, role: user.role });
    const res = NextResponse.json({ user: { id: user.id, role: user.role } });
    res.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true,
      maxAge: 60 * 60 * 24 * 14
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Login error' }, { status: 500 });
  }
}
