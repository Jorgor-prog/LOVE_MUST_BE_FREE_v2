import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

const COOKIE_NAME = 'token';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

type TokenPayload = { uid: number; role: 'ADMIN' | 'USER' };

// Подпись токена
export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

// Проверка токена
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Кука: установить
export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });
}

// Кука: очистить
export function clearAuthCookie(res: NextResponse) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });
}

// Достать payload из запроса (API route с req)
export function getTokenFromRequest(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Достать текущего пользователя из запроса (API route с req)
export async function getUserFromRequest(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    include: { profile: true, codeConfig: true }
  });
  return user;
}

// Требует авторизацию в API route
export async function requireAuth(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return null;
  return payload;
}

// Требует роль ADMIN в API route
export async function requireAdmin(req: NextRequest) {
  const payload = await requireAuth(req);
  if (!payload || payload.role !== 'ADMIN') return null;
  return payload;
}

/* =========================================================
   COMPAT: функции для существующего кода без req (SSR/route handlers),
   где используется cookies() напрямую. Это закрывает ошибки:
   - getSessionUser (именно её не хватало)
   - при желании есть и getSessionPayload
   ========================================================= */

// Вернуть payload из cookies() (без req)
export function getSessionPayload(): TokenPayload | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Вернуть текущего пользователя из cookies() (без req)
// ЭТО И ЕСТЬ ОТСУТСТВОВАВШАЯ ФУНКЦИЯ
export async function getSessionUser() {
  const payload = getSessionPayload();
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    include: { profile: true, codeConfig: true }
  });
  return user;
}
