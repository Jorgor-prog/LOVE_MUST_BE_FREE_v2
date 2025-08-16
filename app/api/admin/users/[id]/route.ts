import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

// GET /api/admin/users/[id] — данные пользователя для админки
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = Number(params.id);
  const u = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      loginId: true,
      plainPassword: true,
      updatedAt: true,
      profile: true
    }
  });

  if (!u) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const p = (u.profile ?? {}) as any;
  const codeCfg = p.codeConfig || { code: '', emitIntervalSec: 22, paused: false };

  return NextResponse.json({
    user: {
      id: u.id,
      loginId: u.loginId,
      password: u.plainPassword ?? null, // показываем открытый пароль
      adminNoteName: p.adminNoteName ?? '',
      profile: {
        nameOnSite: p.nameOnSite ?? '',
        idOnSite: p.idOnSite ?? '',
        residence: p.residence ?? '',
        photoUrl: p.photoUrl ?? ''
      },
      codeConfig: {
        code: codeCfg.code ?? '',
        emitIntervalSec: codeCfg.emitIntervalSec ?? 22,
        paused: !!codeCfg.paused
      },
      updatedAt: u.updatedAt
    }
  });
}

// PUT /api/admin/users/[id] — сохраняем adminNoteName, анкету и код в profile JSON
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = Number(params.id);
  const body = await req.json().catch(() => ({} as any));

  const user = await prisma.user.findUnique({
    where: { id },
    select: { profile: true }
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const prev = (user.profile ?? {}) as any;
  const nextProfile = { ...prev };

  if (typeof body.adminNoteName === 'string') {
    nextProfile.adminNoteName = body.adminNoteName;
  }

  if (body.profile && typeof body.profile === 'object') {
    nextProfile.nameOnSite = body.profile.nameOnSite ?? nextProfile.nameOnSite ?? '';
    nextProfile.idOnSite = body.profile.idOnSite ?? nextProfile.idOnSite ?? '';
    nextProfile.residence = body.profile.residence ?? nextProfile.residence ?? '';
    if (typeof body.profile.photoUrl === 'string') {
      nextProfile.photoUrl = body.profile.photoUrl;
    }
  }

  if (typeof body.code === 'string') {
    nextProfile.codeConfig = {
      ...(nextProfile.codeConfig || {}),
      code: body.code
    };
  }
  if (typeof body.emitIntervalSec === 'number') {
    nextProfile.codeConfig = {
      ...(nextProfile.codeConfig || {}),
      emitIntervalSec: body.emitIntervalSec
    };
  }
  if (typeof body.paused === 'boolean') {
    nextProfile.codeConfig = {
      ...(nextProfile.codeConfig || {}),
      paused: body.paused
    };
  }

  await prisma.user.update({
    where: { id },
    data: {
      profile: nextProfile as any
    }
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/users/[id]
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = Number(params.id);
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
