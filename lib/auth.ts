// lib/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme') as any;
    return payload;
  } catch (err) {
    throw new Error('Unauthorized');
  }
}

export async function requireAdmin(req: NextRequest) {
  const user = await requireAuth(req);
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  return user;
}
