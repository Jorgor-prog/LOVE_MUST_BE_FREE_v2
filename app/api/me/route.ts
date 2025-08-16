// app/api/me/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  const s = getSession();
  if (!s) return NextResponse.json({ user: null });
  const u = await prisma.user.findUnique({
    where: { id: s.uid },
    select: { id: true, role: true, loginId: true }
  });
  return NextResponse.json({ user: u });
}
