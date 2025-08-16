// lib/auth.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export type Session = { uid: number; role: 'ADMIN' | 'USER' };

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export function getSession(): Session | null {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return null;
    const data = jwt.verify(token, SECRET) as Session;
    if (!data?.uid || !data?.role) return null;
    return data;
  } catch {
    return null;
  }
}

export function signSession(p: Session): string {
  return jwt.sign(p, SECRET, { expiresIn: '14d' });
}

export function assertAdmin(): Session {
  const s = getSession();
  if (!s || s.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return s;
}
