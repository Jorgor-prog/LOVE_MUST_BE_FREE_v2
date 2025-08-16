import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request){
  const me = await getSessionUser();
  if(!me) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const { toId, text } = await req.json();
  if(!toId || !text?.trim()) return NextResponse.json({ error:'Bad request' }, { status:400 });

  const msg = await prisma.message.create({
    data: { fromId: me.id, toId: Number(toId), text: String(text) }
  });
  return NextResponse.json({ message: msg });
}
