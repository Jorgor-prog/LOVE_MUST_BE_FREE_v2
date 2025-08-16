import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

const COOKIE_NAME = 'token';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

type TokenPayload = { uid: number; role: 'ADMIN' | 'USER' };

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

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

export function getTokenFromRequest(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getUserFromRequest(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    include: { profile: true, codeConfig: true }
  });
  return user;
}

export async function requireAuth(req: NextRequest) {
  const payload = getTokenFromRequest(req);
  if (!payload) return null;
  return payload;
}

export async function requireAdmin(req: NextRequest) {
  const payload = await requireAuth(req);
  if (!payload || payload.role !== 'ADMIN') return null;
  return payload;
}
