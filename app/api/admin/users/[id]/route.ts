import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = Number(params.id);
  const u = await prisma.user.findUnique({
    where: { id, role: 'USER' },
    select: {
      id: true, loginId: true, loginPassword: true, adminNoteName: true,
      profile: { select: { nameOnSite: true, idOnSite: true, residence: true, photoUrl: true } },
      codeConfig: { select: { code: true, emitIntervalSec: true, paused: true } },
      isOnline: true, updatedAt: true
    }
  });
  if (!u) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ user: { ...u, password: u.loginPassword ?? null } });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = Number(params.id);
  const body = await req.json().catch(()=> ({}));

  // profile update
  if (body?.profile) {
    const { nameOnSite='', idOnSite='', residence='' } = body.profile;
    await prisma.profile.upsert({
      where: { userId: id },
      update: { nameOnSite, idOnSite, residence },
      create: { userId: id, nameOnSite, idOnSite, residence }
    });
  }

  // admin note + code settings
  const data: any = {};
  if (typeof body?.adminNoteName === 'string') data.adminNoteName = body.adminNoteName;
  if (body?.code !== undefined || body?.emitIntervalSec !== undefined) {
    await prisma.codeConfig.upsert({
      where: { userId: id },
      update: {
        code: body?.code ?? undefined,
        emitIntervalSec: body?.emitIntervalSec ?? undefined
      },
      create: {
        userId: id,
        code: String(body?.code ?? ''),
        emitIntervalSec: Number(body?.emitIntervalSec ?? 22)
      }
    });
  }
  if (Object.keys(data).length) {
    await prisma.user.update({ where: { id }, data });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const id = Number(params.id);

  await prisma.message.deleteMany({ where: { OR: [{ fromId: id }, { toId: id }] } });
  await prisma.codeConfig.deleteMany({ where: { userId: id } });
  await prisma.profile.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
