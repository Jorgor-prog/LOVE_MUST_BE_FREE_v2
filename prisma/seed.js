import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminLogin = process.env.ADMIN_LOGIN || 'admin';
  const adminPlain = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = await bcrypt.hash(adminPlain, 10);

  const admin = await prisma.user.upsert({
    where: { loginId: adminLogin },
    update: {
      password: hash,
      plainPassword: adminPlain,
      role: 'ADMIN'
    },
    create: {
      loginId: adminLogin,
      password: hash,
      plainPassword: adminPlain,
      role: 'ADMIN',
      profile: {}
    }
  });

  console.log('Admin created:');
  console.log('Login:', adminLogin);
  console.log('Password:', adminPlain);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
