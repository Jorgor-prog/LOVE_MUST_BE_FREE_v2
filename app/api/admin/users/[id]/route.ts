import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: Number(params.id) },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  return new Response(
    JSON.stringify({
      user: { ...user, password: user.plainPassword }, // показываем открытый пароль
    }),
    { status: 200 }
  );
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const user = await prisma.user.update({
    where: { id: Number(params.id) },
    data: {
      adminNoteName: body.adminNoteName,
      profile: body.profile,
      codeConfig: body.code ? { code: body.code, emitIntervalSec: body.emitIntervalSec } : undefined,
    },
  });

  return new Response(
    JSON.stringify({
      user: { ...user, password: user.plainPassword },
    }),
    { status: 200 }
  );
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.user.delete({ where: { id: Number(params.id) } });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
