import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const AUTH_COOKIE = 'session';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

type SessionPayload = {
  id: number;
  role: string; // 'ADMIN' | 'USER'
};

export function setAuthCookie(res: Response, payload: SessionPayload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '14d' });
  // @ts-ignore — у NextResponse есть cookies.set
  res.cookies.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 14
  });
}

export function clearAuthCookie(res: Response) {
  // @ts-ignore
  res.cookies.set({
    name: AUTH_COOKIE,
    value: '',
    path: '/',
    httpOnly: true,
    maxAge: 0
  });
}

/** Используется в серверных роутингах, чтобы отличать ADMIN/USER */
export async function getSessionUser(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    const data = jwt.verify(token, JWT_SECRET) as SessionPayload;
    if (!data?.id || !data?.role) return null;
    return data;
  } catch {
    return null;
  }
}
