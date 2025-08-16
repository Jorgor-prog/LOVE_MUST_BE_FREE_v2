export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = Number(params.id);
  const user = await prisma.user.findUnique({
    where: { id },
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
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = Number(params.id);
  const body = await req.json();

  const dataUser: any = {};
  const dataProfile: any = {};
  const dataCode: any = {};

  if (typeof body.adminNoteName === 'string') dataUser.adminNoteName = body.adminNoteName;

  if (body.profile) {
    const { nameOnSite, idOnSite, residence } = body.profile;
    if (typeof nameOnSite === 'string') dataProfile.nameOnSite = nameOnSite;
    if (typeof idOnSite === 'string') dataProfile.idOnSite = idOnSite;
    if (typeof residence === 'string') dataProfile.residence = residence;
  }

  if (typeof body.code === 'string') dataCode.code = body.code;
  if (typeof body.emitIntervalSec === 'number') dataCode.emitIntervalSec = body.emitIntervalSec;
  if (typeof body.paused === 'boolean') dataCode.paused = body.paused;

  await prisma.user.update({
    where: { id },
    data: {
      ...(Object.keys(dataUser).length ? dataUser : {}),
      profile: Object.keys(dataProfile).length
        ? { upsert: { create: dataProfile, update: dataProfile } }
        : undefined,
      codeConfig: Object.keys(dataCode).length
        ? { upsert: { create: { code: '', emitIntervalSec: 22, paused: false, ...dataCode }, update: dataCode } }
        : undefined
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = Number(params.id);

  await prisma.message.deleteMany({ where: { OR: [{ fromId: id }, { toId: id }] } });
  await prisma.codeConfig.deleteMany({ where: { userId: id } });
  await prisma.profile.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
