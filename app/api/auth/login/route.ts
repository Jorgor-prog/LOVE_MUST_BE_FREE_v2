import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { loginId, password } = await req.json();

    // Находим пользователя по логину
    const user = await prisma.user.findUnique({
      where: { loginId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Проверяем пароль
    let ok = false;

    if (user.role === 'ADMIN') {
      // Админ: проверяем через bcrypt
      if (!user.password) {
        return NextResponse.json({ error: 'Admin password not set' }, { status: 500 });
      }
      ok = await bcrypt.compare(password, user.password);
    } else {
      // Обычные пользователи: сравниваем напрямую (или тоже через bcrypt, если уже хэшируешь)
      ok = password === user.password;
    }

    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Создаём токен
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '7d' }
    );

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
