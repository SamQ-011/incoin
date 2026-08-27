import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateMetadataHash } from "@/lib/metadata";

// GET /api/credentials - List credentials with optional query filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentAddress = searchParams.get("studentAddress")?.toLowerCase();
    const issuerAddress = searchParams.get("issuerAddress")?.toLowerCase();
    const status = searchParams.get("status");
    const tokenIdStr = searchParams.get("tokenId");

    const whereClause: Record<string, unknown> = {};

    if (tokenIdStr) {
      whereClause.tokenId = parseInt(tokenIdStr, 10);
    }
    if (status) {
      whereClause.status = status;
    }
    if (studentAddress) {
      whereClause.student = { walletAddress: studentAddress };
    }
    if (issuerAddress) {
      whereClause.issuer = { walletAddress: issuerAddress };
    }

    const credentials = await prisma.credential.findMany({
      where: whereClause,
      include: {
        issuer: true,
        student: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: credentials });
  } catch (error) {
    console.error("Error listing credentials:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar credenciales" },
      { status: 500 }
    );
  }
}

// POST /api/credentials - Register a new credential metadata off-chain and calculate Keccak-256 hash
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      issuerAddress,
      studentAddress,
      studentName,
      credentialType,
      title,
      description,
      hours,
      identityNumber,
      career,
    } = body;

    // Validation
    if (!issuerAddress || !studentAddress || !title || !credentialType) {
      return NextResponse.json(
        {
          success: false,
          error: "issuerAddress, studentAddress, title y credentialType son obligatorios",
        },
        { status: 400 }
      );
    }

    const normalizedIssuer = issuerAddress.toLowerCase();
    const normalizedStudent = studentAddress.toLowerCase();

    // 1. Ensure issuer exists and is authorized
    const issuer = await prisma.issuer.findUnique({
      where: { walletAddress: normalizedIssuer },
    });

    if (!issuer || !issuer.isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Institución emisora no registrada o no autorizada en la red INCOIN",
        },
        { status: 403 }
      );
    }

    // 2. Ensure student profile exists
    let student = await prisma.student.findUnique({
      where: { walletAddress: normalizedStudent },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          walletAddress: normalizedStudent,
          fullName: studentName || "Estudiante INCOS",
          identityNumber: identityNumber || null,
          career: career || "Sistemas Informáticos",
        },
      });
    } else if (studentName && student.fullName !== studentName) {
      student = await prisma.student.update({
        where: { id: student.id },
        data: { fullName: studentName },
      });
    }

    const now = new Date();
    const issuedAtIso = now.toISOString();

    // 3. Generate deterministic Keccak256 hash matching on-chain standard
    const metadataHash = generateMetadataHash({
      title,
      credentialType,
      studentAddress: normalizedStudent,
      studentName: student.fullName,
      issuerAddress: normalizedIssuer,
      issuerName: issuer.name,
      hours: hours ? Number(hours) : 0,
      description: description || "",
      issuedAt: issuedAtIso,
    });

    // 4. Save credential with PENDING_ONCHAIN status
    const credential = await prisma.credential.create({
      data: {
        credentialType,
        title,
        description: description || null,
        hours: hours ? Number(hours) : null,
        metadataHash,
        issueDate: now,
        status: "PENDING_ONCHAIN",
        issuerId: issuer.id,
        studentId: student.id,
      },
      include: {
        issuer: true,
        student: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          credential,
          metadataHash,
          readyForOnChain: {
            to: normalizedStudent,
            credentialType,
            metadataHash,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating credential:", error);
    return NextResponse.json(
      { success: false, error: "Error al registrar la credencial" },
      { status: 500 }
    );
  }
}
