import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = Number(ctx.params.id);
  if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true, codeConfig: true }
  });
  if (!user || user.role !== 'USER') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // маппим loginPassword -> password для удобства админки
  const payload = {
    id: user.id,
    loginId: user.loginId,
    adminNoteName: user.adminNoteName,
    isOnline: user.isOnline,
    updatedAt: user.updatedAt,
    profile: user.profile ? {
      nameOnSite: user.profile.nameOnSite || '',
      idOnSite: user.profile.idOnSite || '',
      residence: user.profile.residence || '',
      photoUrl: user.profile.photoUrl || null
    } : undefined,
    codeConfig: user.codeConfig ? {
      code: user.codeConfig.code || '',
      emitIntervalSec: user.codeConfig.emitIntervalSec,
      paused: user.codeConfig.paused
    } : undefined,
    password: user.loginPassword || null
  };

  return NextResponse.json({ user: payload });
}

export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = Number(ctx.params.id);
  if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 });

  const body = await req.json().catch(() => ({}));

  const { profile, adminNoteName, code, emitIntervalSec } = body || {};

  // Обновление заметки админа
  if (typeof adminNoteName === 'string') {
    await prisma.user.update({
      where: { id },
      data: { adminNoteName }
    });
  }

  // Обновление профиля
  if (profile && typeof profile === 'object') {
    const { nameOnSite, idOnSite, residence } = profile;
    const existing = await prisma.profile.findUnique({ where: { userId: id } });
    if (existing) {
      await prisma.profile.update({
        where: { userId: id },
        data: {
          nameOnSite: typeof nameOnSite === 'string' ? nameOnSite : existing.nameOnSite,
          idOnSite: typeof idOnSite === 'string' ? idOnSite : existing.idOnSite,
          residence: typeof residence === 'string' ? residence : existing.residence
        }
      });
    } else {
      await prisma.profile.create({
        data: {
          userId: id,
          nameOnSite: typeof nameOnSite === 'string' ? nameOnSite : '',
          idOnSite: typeof idOnSite === 'string' ? idOnSite : '',
          residence: typeof residence === 'string' ? residence : ''
        }
      });
    }
  }

  // Обновление настроек кода
  if (typeof code === 'string' || typeof emitIntervalSec === 'number') {
    const cfg = await prisma.codeConfig.findUnique({ where: { userId: id } });
    if (cfg) {
      await prisma.codeConfig.update({
        where: { userId: id },
        data: {
          code: typeof code === 'string' ? code : cfg.code,
          emitIntervalSec: typeof emitIntervalSec === 'number' ? emitIntervalSec : cfg.emitIntervalSec
        }
      });
    } else {
      await prisma.codeConfig.create({
        data: {
          userId: id,
          code: typeof code === 'string' ? code : '',
          emitIntervalSec: typeof emitIntervalSec === 'number' ? emitIntervalSec : 22
        }
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = Number(ctx.params.id);
  if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 });

  // Удаляем зависимые сущности вручную, чтобы избежать конфликтов FK
  await prisma.message.deleteMany({ where: { OR: [{ fromId: id }, { toId: id }] } }).catch(() => {});
  await prisma.codeConfig.deleteMany({ where: { userId: id } }).catch(() => {});
  await prisma.profile.deleteMany({ where: { userId: id } }).catch(() => {});
  await prisma.user.delete({ where: { id } }).catch(() => {});

  return NextResponse.json({ ok: true });
}
