import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // @ts-ignore
    const cookies = req.headers.get('cookie') || '';
    const map = new Map<string,string>();
    cookies.split(';').forEach(p=>{
      const [k, ...rest] = p.trim().split('=');
      if(k) map.set(k, decodeURIComponent(rest.join('=')));
    });

    const uid = Number(map.get('uid') || '0');
    if (!uid) return NextResponse.json({ user: null });

    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: {
        id: true, role: true, loginId: true, adminNoteName: true,
        profile: { select: { nameOnSite: true, idOnSite: true, residence: true, photoUrl: true } },
        codeConfig: { select: { code: true, emitIntervalSec: true, paused: true } }
      }
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
