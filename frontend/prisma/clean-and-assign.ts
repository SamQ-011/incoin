import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete mock seed credentials so only real on-chain credentials exist
  await prisma.credential.deleteMany({
    where: {
      tokenId: { in: [1, 2, 3, 4] },
      status: "ISSUED",
      student: {
        walletAddress: { not: "0x16aaa6c8e9ca41abb860c3d1bbfb60c4b82fff0d".toLowerCase() }
      }
    }
  });

  // Find the real credential emitted to Angel Samuel Quisbert Vargas
  const cred = await prisma.credential.findFirst({
    where: {
      student: {
        walletAddress: "0x16aaa6c8e9ca41abb860c3d1bbfb60c4b82fff0d".toLowerCase(),
      },
    },
    include: { student: true }
  });

  if (cred) {
    const updated = await prisma.credential.update({
      where: { id: cred.id },
      data: {
        tokenId: 1,
        txHash: "0xf0d38e25c4a16198f1f1d1633516591783515037d45209772bf260a927efb3aa",
        status: "ISSUED",
      }
    });
    console.log("✅ Token #1 Oficial asignado a:", cred.student.fullName, "(", updated.title, ")");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
