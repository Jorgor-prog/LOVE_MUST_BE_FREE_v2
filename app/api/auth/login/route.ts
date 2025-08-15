import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request){
  const { loginId, password } = await req.json();
  if(!loginId || !password) return NextResponse.json({ error: 'Missing' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { loginId } });
  if(!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  let ok = false;
  if (user.passwordHash) ok = await bcrypt.compare(password, user.passwordHash);
  else if (user.loginPassword) ok = password === user.loginPassword;
  if(!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  await setSessionCookie(user.id, user.role);
  return NextResponse.json({ ok: true });
}
