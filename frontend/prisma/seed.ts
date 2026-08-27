import { PrismaClient } from "@prisma/client";
import { keccak256, toHex } from "viem";

const prisma = new PrismaClient();

function computeMetadataHash(payload: {
  title: string;
  credentialType: string;
  studentAddress: string;
  studentName: string;
  issuerAddress: string;
  issuerName: string;
  hours?: number | null;
  description?: string | null;
  issuedAt: string;
}) {
  const canonicalData = {
    title: payload.title.trim(),
    credentialType: payload.credentialType,
    studentAddress: payload.studentAddress.toLowerCase(),
    studentName: payload.studentName.trim(),
    issuerAddress: payload.issuerAddress.toLowerCase(),
    issuerName: payload.issuerName.trim(),
    hours: payload.hours ?? 0,
    description: payload.description?.trim() ?? "",
    issuedAt: payload.issuedAt,
  };

  const jsonString = JSON.stringify(canonicalData, Object.keys(canonicalData).sort());
  return keccak256(toHex(jsonString));
}

async function main() {
  console.log("🌱 Iniciando sembrado de datos para INCOIN...");

  // 1. Institución principal: INCOS El Alto
  // Dirección de ejemplo para la wallet de la institución
  const incosWallet = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266".toLowerCase();

  const incos = await prisma.issuer.upsert({
    where: { walletAddress: incosWallet },
    update: {
      name: "Instituto Comercial Superior de la Nación - INCOS El Alto",
      shortName: "INCOS El Alto",
      type: "INSTITUTO_TECNICO",
      description: "Institución de educación técnica y tecnológica superior de excelencia en El Alto, Bolivia.",
      website: "https://incos-elalto.edu.bo",
      isAuthorized: true,
    },
    create: {
      walletAddress: incosWallet,
      name: "Instituto Comercial Superior de la Nación - INCOS El Alto",
      shortName: "INCOS El Alto",
      type: "INSTITUTO_TECNICO",
      description: "Institución de educación técnica y tecnológica superior de excelencia en El Alto, Bolivia.",
      website: "https://incos-elalto.edu.bo",
      isAuthorized: true,
    },
  });

  console.log(`✅ Institución registrada: ${incos.name} (${incos.walletAddress})`);

  // 2. Estudiantes de muestra
  const studentWallet1 = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8".toLowerCase();
  const student1 = await prisma.student.upsert({
    where: { walletAddress: studentWallet1 },
    update: {
      fullName: "Rodrigo Quispe Mamani",
      email: "rodrigo.quispe@estudiante.incos.bo",
      identityNumber: "8392014 LP",
      career: "Sistemas Informáticos",
    },
    create: {
      walletAddress: studentWallet1,
      fullName: "Rodrigo Quispe Mamani",
      email: "rodrigo.quispe@estudiante.incos.bo",
      identityNumber: "8392014 LP",
      career: "Sistemas Informáticos",
    },
  });

  const studentWallet2 = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc".toLowerCase();
  const student2 = await prisma.student.upsert({
    where: { walletAddress: studentWallet2 },
    update: {
      fullName: "Elena Condori Flores",
      email: "elena.condori@estudiante.incos.bo",
      identityNumber: "9182374 LP",
      career: "Comercio Internacional",
    },
    create: {
      walletAddress: studentWallet2,
      fullName: "Elena Condori Flores",
      email: "elena.condori@estudiante.incos.bo",
      identityNumber: "9182374 LP",
      career: "Comercio Internacional",
    },
  });

  console.log(`✅ Estudiantes registrados: ${student1.fullName}, ${student2.fullName}`);

  // 3. Credenciales de muestra
  const date1 = new Date("2026-02-15T14:30:00Z");
  const hash1 = computeMetadataHash({
    title: "Técnico Superior en Sistemas Informáticos",
    credentialType: "ACADEMIC_DEGREE",
    studentAddress: student1.walletAddress,
    studentName: student1.fullName,
    issuerAddress: incos.walletAddress,
    issuerName: incos.name,
    hours: 3600,
    description: "Título profesional oficial avalado por el Ministerio de Educación y conferido por INCOS El Alto.",
    issuedAt: date1.toISOString(),
  });

  await prisma.credential.upsert({
    where: { tokenId: 1 },
    update: {},
    create: {
      tokenId: 1,
      txHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
      credentialType: "ACADEMIC_DEGREE",
      title: "Técnico Superior en Sistemas Informáticos",
      description: "Título profesional oficial avalado por el Ministerio de Educación y conferido por INCOS El Alto.",
      hours: 3600,
      metadataHash: hash1,
      issueDate: date1,
      status: "ISSUED",
      issuerId: incos.id,
      studentId: student1.id,
    },
  });

  const date2 = new Date("2026-04-10T10:00:00Z");
  const hash2 = computeMetadataHash({
    title: "Certificación en Desarrollo Web Fullstack y Blockchain",
    credentialType: "CERTIFICATION",
    studentAddress: student1.walletAddress,
    studentName: student1.fullName,
    issuerAddress: incos.walletAddress,
    issuerName: incos.name,
    hours: 50,
    description: "Aprobación del programa especializado de desarrollo Web3, Smart Contracts y arquitectura fullstack.",
    issuedAt: date2.toISOString(),
  });

  await prisma.credential.upsert({
    where: { tokenId: 2 },
    update: {},
    create: {
      tokenId: 2,
      txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      credentialType: "CERTIFICATION",
      title: "Certificación en Desarrollo Web Fullstack y Blockchain",
      description: "Aprobación del programa especializado de desarrollo Web3, Smart Contracts y arquitectura fullstack.",
      hours: 50,
      metadataHash: hash2,
      issueDate: date2,
      status: "ISSUED",
      issuerId: incos.id,
      studentId: student1.id,
    },
  });

  const date3 = new Date("2026-06-20T16:00:00Z");
  const hash3 = computeMetadataHash({
    title: "Pasantía Profesional en Desarrollo de Software — 240 Horas",
    credentialType: "INTERNSHIP",
    studentAddress: student1.walletAddress,
    studentName: student1.fullName,
    issuerAddress: incos.walletAddress,
    issuerName: incos.name,
    hours: 240,
    description: "Cumplimiento satisfactorio del periodo de práctica laboral en desarrollo de sistemas empresariales.",
    issuedAt: date3.toISOString(),
  });

  await prisma.credential.upsert({
    where: { tokenId: 3 },
    update: {},
    create: {
      tokenId: 3,
      txHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
      credentialType: "INTERNSHIP",
      title: "Pasantía Profesional en Desarrollo de Software — 240 Horas",
      description: "Cumplimiento satisfactorio del periodo de práctica laboral en desarrollo de sistemas empresariales.",
      hours: 240,
      metadataHash: hash3,
      issueDate: date3,
      status: "ISSUED",
      issuerId: incos.id,
      studentId: student1.id,
    },
  });

  const date4 = new Date("2026-07-05T09:00:00Z");
  const hash4 = computeMetadataHash({
    title: "Voluntariado de Alfabetización Digital Comunitaria — 80 Horas",
    credentialType: "VOLUNTEERING",
    studentAddress: student2.walletAddress,
    studentName: student2.fullName,
    issuerAddress: incos.walletAddress,
    issuerName: incos.name,
    hours: 80,
    description: "Participación destacada en talleres comunitarios de inclusión tecnológica en la ciudad de El Alto.",
    issuedAt: date4.toISOString(),
  });

  await prisma.credential.upsert({
    where: { tokenId: 4 },
    update: {},
    create: {
      tokenId: 4,
      txHash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
      credentialType: "VOLUNTEERING",
      title: "Voluntariado de Alfabetización Digital Comunitaria — 80 Horas",
      description: "Participación destacada en talleres comunitarios de inclusión tecnológica en la ciudad de El Alto.",
      hours: 80,
      metadataHash: hash4,
      issueDate: date4,
      status: "ISSUED",
      issuerId: incos.id,
      studentId: student2.id,
    },
  });

  console.log("✅ 4 credenciales emitidas registradas en base de datos para INCOIN.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
