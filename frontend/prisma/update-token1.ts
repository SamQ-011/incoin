import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cred = await prisma.credential.findFirst({
    where: {
      student: {
        walletAddress: "0x16aaa6c8e9ca41abb860c3d1bbfb60c4b82fff0d".toLowerCase(),
      },
    },
    include: {
      student: true,
      issuer: true,
    },
  });

  if (cred) {
    const updated = await prisma.credential.update({
      where: { id: cred.id },
      data: {
        tokenId: 1,
        status: "ISSUED",
      },
    });
    console.log("✅ Credencial actualizada a Token #1:", updated.title, "para", cred.student.fullName);
  } else {
    console.log("❌ No se encontró la credencial pendiente.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
