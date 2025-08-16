import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const me = await getSessionUser();
  if(!me) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const cfg = await prisma.codeConfig.upsert({
    where: { userId: me.id },
    update: {},
    create: { userId: me.id, code:'', emitIntervalSec:22, paused:false, cursor:0, lastStep:6 }
  });

  const text = cfg.code || '';
  let cursor = cfg.cursor || 0;
  const interval = Math.max(1, cfg.emitIntervalSec || 22) * 1000;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      async function send(type:string, value:any){
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({type, value})}\n\n`));
      }
      // помечаем, что пользователь на шаге 6
      await prisma.codeConfig.update({ where:{ userId: me.id }, data:{ lastStep:6 } });

      while(cursor < text.length){
        const fresh = await prisma.codeConfig.findUnique({ where:{ userId: me.id }, select:{ paused:true } });
        if(fresh?.paused){
          await new Promise(r=>setTimeout(r, 1000));
          continue;
        }
        const ch = text[cursor];
        await prisma.codeConfig.update({ where:{ userId: me.id }, data:{ cursor: cursor+1 } });
        cursor++;
        await send('char', ch);
        await new Promise(r=>setTimeout(r, interval));
      }
      await send('done', true);
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}
