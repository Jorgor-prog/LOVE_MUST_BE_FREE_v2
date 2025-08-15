import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
export async function GET(){ const u = await getSessionUser(); return NextResponse.json({ user: u?{ ...u, passwordHash: undefined }: null }); }
