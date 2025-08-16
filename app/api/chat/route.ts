export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/chat?peerId=NUMBER
 * Возвращает все сообщения между мной и peerId
 */
export async function GET(req: NextRequest) {
  const payload = await requireAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const peerId = Number(searchParams.get('peerId') || '0');
  if (!peerId) return NextResponse.json({ messages: [] });

  const msgs = await prisma.message.findMany({
    where: {
      OR: [
        { fromId: payload.uid, toId: peerId },
        { fromId: peerId, toId: payload.uid }
      ]
    },
    orderBy: { id: 'asc' },
    select: { id: true, fromId: true, toId: true, text: true, createdAt: true }
  });

  return NextResponse.json({ messages: msgs });
}

/**
 * POST /api/chat
 * body: { toId: number, text: string }
 */
export async function POST(req: NextRequest) {
  const payload = await requireAuth(req);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { toId, text } = await req.json();
  if (!toId || !text) return NextResponse.json({ error: 'Missing' }, { status: 400 });

  const msg = await prisma.message.create({
    data: { fromId: payload.uid, toId, text }
  });

  return NextResponse.json({ message: msg });
}
