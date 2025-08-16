export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * Возвращает максимальный ID сообщения, пришедшего текущему пользователю.
 * Клиент сравнивает с lastSeenId из localStorage.
 */
export async function GET(req: NextRequest) {
  const payload = await requireAuth(req);
  if (!payload) return NextResponse.json({ latestId: 0 });

  const latest = await prisma.message.findFirst({
    where: { toId: payload.uid },
    orderBy: { id: 'desc' },
    select: { id: true }
  });

  return NextResponse.json({ latestId: latest?.id || 0 });
}
