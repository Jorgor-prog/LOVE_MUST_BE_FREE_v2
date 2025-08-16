export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

function randomPassword(len = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { role: { not: 'ADMIN' } },
    orderBy: { id: 'desc' },
    select: {
      id: true,
      loginId: true,
      loginPassword: true,
      adminNoteName: true,
      isOnline: true,
      updatedAt: true,
      profile: { select: { nameOnSite: true, idOnSite: true, residence: true, photoUrl: true } },
      codeConfig: { select: { code: true, emitIntervalSec: true, paused: true } }
    }
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { adminNoteName } = await req.json().catch(() => ({}));

  const loginId = `user${Date.now()}`;
  const rawPass = randomPassword(12);
  const hash = await bcrypt.hash(rawPass, 10);

  const u = await prisma.user.create({
    data: {
      loginId,
      loginPassword: rawPass,      // показываемый пароль для админки
      passwordHash: hash,          // реальная проверка
      role: 'USER',
      adminNoteName: adminNoteName || '',
      profile: { create: {} },
      codeConfig: { create: { code: '', emitIntervalSec: 22, paused: false } }
    },
    select: {
      id: true,
      loginId: true,
      loginPassword: true
    }
  });

  return NextResponse.json({ user: u });
}
