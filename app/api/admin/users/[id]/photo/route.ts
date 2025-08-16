export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = Number(params.id);
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const ab = await file.arrayBuffer();
  const b64 = Buffer.from(ab).toString('base64');
  const mime = file.type || 'image/jpeg';
  const dataUrl = `data:${mime};base64,${b64}`;

  await prisma.user.update({
    where: { id: userId },
    data: {
      profile: {
        upsert: {
          create: { photoUrl: dataUrl },
          update: { photoUrl: dataUrl }
        }
      }
    }
  });

  return NextResponse.json({ ok: true });
}
