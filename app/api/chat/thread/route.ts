import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  const me = await getSessionUser();
  if(!me) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const url = new URL(req.url);
  const withId = Number(url.searchParams.get('with'));
  if(!withId) return NextResponse.json({ error:'Bad request' }, { status:400 });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromId: me.id, toId: withId },
        { fromId: withId, toId: me.id }
      ]
    },
    orderBy: { id: 'asc' },
    select: { id:true, fromId:true, toId:true, text:true, createdAt:true }
  });

  return NextResponse.json({ messages });
}
