export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: user.id,
      role: user.role,
      loginId: user.loginId,
      profile: user.profile ?? null,
      codeConfig: user.codeConfig ?? null
    }
  });
}
