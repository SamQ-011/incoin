import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sepoliaIssuerWallet = "0xc76ee7b6b93cbbfbb8c66a70ed4ea3ab84f7e8fd".toLowerCase();

  const issuer = await prisma.issuer.upsert({
    where: { walletAddress: sepoliaIssuerWallet },
    update: {
      name: "Instituto Comercial Superior de la Nación - INCOS El Alto",
      shortName: "INCOS El Alto",
      type: "INSTITUTO_TECNICO",
      description: "Institución de educación técnica y tecnológica superior de excelencia en El Alto, Bolivia.",
      website: "https://incos-elalto.edu.bo",
      isAuthorized: true,
    },
    create: {
      walletAddress: sepoliaIssuerWallet,
      name: "Instituto Comercial Superior de la Nación - INCOS El Alto",
      shortName: "INCOS El Alto",
      type: "INSTITUTO_TECNICO",
      description: "Institución de educación técnica y tecnológica superior de excelencia en El Alto, Bolivia.",
      website: "https://incos-elalto.edu.bo",
      isAuthorized: true,
    },
  });

  console.log("✅ Emisor en Supabase actualizado:", issuer.name, "(", issuer.walletAddress, ")");
}

main().catch(console.error).finally(() => prisma.$disconnect());
