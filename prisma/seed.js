import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const plainPassword = "admin123";
  const hashed = await bcrypt.hash(plainPassword, 10);

  await prisma.user.upsert({
    where: { loginId: "admin" },
    update: {},
    create: {
      loginId: "admin",
      password: hashed,
      plainPassword: plainPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin created:");
  console.log("Login: admin");
  console.log("Password:", plainPassword);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
