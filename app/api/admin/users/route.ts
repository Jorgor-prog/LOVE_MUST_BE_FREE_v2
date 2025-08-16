// app/api/admin/users/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { assertAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

function genLogin() {
  return 'user' + Math.floor(100000 + Math.random() * 900000);
}
function genPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let out = '';
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function GET() {
  try {
    assertAdmin();
    const users = await prisma.user.findMany({
      where: { role: Role.USER },
      orderBy: { id: 'desc' },
      select: {
        id: true, loginId: true, loginPassword: true, adminNoteName: true,
        updatedAt: true, isOnline: true,
        profile: { select: { nameOnSite: true, idOnSite: true, residence: true, photoUrl: true } },
        codeConfig: { select: { code: true, emitIntervalSec: true, paused: true } }
      }
    });
    const normalized = users.map(u => ({
      id: u.id, loginId: u.loginId, password: u.loginPassword || null,
      adminNoteName: u.adminNoteName, updatedAt: u.updatedAt?.toISOString?.() || null,
      isOnline: u.isOnline,
      profile: u.profile || {},
      codeConfig: u.codeConfig || {}
    }));
    return NextResponse.json({ users: normalized });
  } catch (e: any) {
    if (e?.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    assertAdmin();
    const loginId = genLogin();
    const password = genPassword();
    const user = await prisma.user.create({
      data: {
        loginId,
        loginPassword: password,
        role: Role.USER,
        adminNoteName: '',
        profile: { create: {} },
        codeConfig: { create: { code: '', emitIntervalSec: 22, paused: false } }
      },
      select: { id: true, loginId: true }
    });
    return NextResponse.json({ user: { id: user.id, loginId: user.loginId, password } });
  } catch (e: any) {
    if (e?.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
