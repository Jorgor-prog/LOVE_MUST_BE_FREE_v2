// app/api/admin/users/[id]/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { assertAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    assertAdmin();
    const id = Number(params.id);
    const u = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, loginId: true, loginPassword: true, adminNoteName: true,
        updatedAt: true, isOnline: true,
        profile: { select: { nameOnSite: true, idOnSite: true, residence: true, photoUrl: true } },
        codeConfig: { select: { code: true, emitIntervalSec: true, paused: true } }
      }
    });
    if (!u) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({
      user: {
        id: u.id, loginId: u.loginId, password: u.loginPassword || null,
        adminNoteName: u.adminNoteName,
        updatedAt: u.updatedAt?.toISOString?.() || null,
        isOnline: u.isOnline,
        profile: u.profile || {},
        codeConfig: u.codeConfig || {}
      }
    });
  } catch (e: any) {
    if (e?.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    assertAdmin();
    const id = Number(params.id);
    const body = await req.json();

    // profile
    if (body?.profile) {
      const { nameOnSite = '', idOnSite = '', residence = '' } = body.profile;
      await prisma.profile.upsert({
        where: { userId: id },
        update: { nameOnSite, idOnSite, residence },
        create: { userId: id, nameOnSite, idOnSite, residence }
      });
    }

    // admin note
    if (typeof body?.adminNoteName === 'string') {
      await prisma.user.update({ where: { id }, data: { adminNoteName: body.adminNoteName } });
    }

    // code config
    if (typeof body?.code === 'string' || typeof body?.emitIntervalSec === 'number' || typeof body?.paused === 'boolean') {
      await prisma.codeConfig.upsert({
        where: { userId: id },
        update: {
          ...(typeof body.code === 'string' ? { code: body.code } : {}),
          ...(typeof body.emitIntervalSec === 'number' ? { emitIntervalSec: body.emitIntervalSec } : {}),
          ...(typeof body.paused === 'boolean' ? { paused: body.paused } : {})
        },
        create: {
          userId: id,
          code: String(body.code || ''),
          emitIntervalSec: Number(body.emitIntervalSec || 22),
          paused: Boolean(body.paused || false)
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    assertAdmin();
    const id = Number(params.id);
    await prisma.message.deleteMany({ where: { OR: [{ fromId: id }, { toId: id }] } });
    await prisma.codeConfig.deleteMany({ where: { userId: id } });
    await prisma.profile.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
