import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const users = await prisma.user.findMany();
  return new Response(
    JSON.stringify({
      users: users.map(u => ({
        ...u,
        password: u.plainPassword, // показываем открытый пароль
      })),
    }),
    { status: 200 }
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const plainPassword = Math.random().toString(36).slice(-8); // генерируем пароль
  const hashed = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.create({
    data: {
      loginId: `user_${Date.now()}`,
      password: hashed,
      plainPassword: plainPassword,
      adminNoteName: body.adminNoteName || null,
    },
  });

  return new Response(
    JSON.stringify({
      user: { ...user, password: plainPassword },
    }),
    { status: 200 }
  );
}
