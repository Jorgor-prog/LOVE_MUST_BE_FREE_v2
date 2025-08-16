import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/admin/users — список (без админа), возвращаем adminNoteName из profile JSON
export async function GET() {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: { not: 'ADMIN' } },
    orderBy: { id: 'desc' },
    select: {
      id: true,
      loginId: true,
      plainPassword: true,
      updatedAt: true,
      profile: true
    }
  });

  const mapped = users.map(u => {
    const p = (u.profile ?? {}) as any;
    return {
      id: u.id,
      loginId: u.loginId,
      password: u.plainPassword ?? null,
      adminNoteName: p.adminNoteName ?? '',
      updatedAt: u.updatedAt,
      isOnline: false // онлайн определяется по updatedAt в клиенте, отдельного поля не делаем
    };
  });

  return NextResponse.json({ users: mapped });
}

// POST /api/admin/users — создаём нового пользователя с видимым паролем
export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const adminNoteName = (body?.adminNoteName ?? '').toString();

  // генерируем логин и пароль
  const loginId = `user${Math.floor(100000 + Math.random() * 900000)}`;
  const plain = Math.random().toString(36).slice(2, 10) + Math.floor(Math.random() * 1000);
  const hash = await bcrypt.hash(plain, 10);

  const created = await prisma.user.create({
    data: {
      loginId,
      password: hash,
      plainPassword: plain,
      role: 'USER',
      profile: {
        adminNoteName,
        nameOnSite: '',
        idOnSite: '',
        residence: '',
        photoUrl: '',
        codeConfig: { code: '', emitIntervalSec: 22, paused: false }
      } as any
    },
    select: {
      id: true,
      loginId: true,
      plainPassword: true
    }
  });

  return NextResponse.json({
    user: {
      id: created.id,
      loginId: created.loginId,
      password: created.plainPassword
    }
  });
}
