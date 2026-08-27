import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateMetadataHash, CREDENTIAL_TYPE_LABELS, CredentialType } from "@/lib/metadata";

interface BatchPayload {
  issuerAddress: string;
  commonData?: {
    credentialType?: string;
    title?: string;
    description?: string;
    hours?: number | string;
  };
  items: Array<{
    studentAddress: string;
    studentName: string;
    identityNumber?: string;
    career?: string;
    credentialType?: string;
    title?: string;
    description?: string;
    hours?: number | string;
  }>;
}

// POST /api/credentials/batch - Prepare batch cohort and compute deterministic hashes
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BatchPayload;
    const { issuerAddress, commonData, items } = body;

    if (!issuerAddress || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "issuerAddress e items son obligatorios" },
        { status: 400 }
      );
    }

    const normalizedIssuer = issuerAddress.toLowerCase();

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

    const createdRecords = [];
    const recipients: string[] = [];
    const metadataHashes: `0x${string}`[] = [];
    const now = new Date();
    const issuedAtIso = now.toISOString();

    for (const item of items) {
      const studentAddress = item.studentAddress?.trim();
      const studentName = item.studentName?.trim() || "Estudiante INCOS";

      const finalTitle = (item.title || commonData?.title || "").trim();
      const finalType = (item.credentialType || commonData?.credentialType || "CERTIFICATION").trim();
      const finalHours =
        item.hours !== undefined && item.hours !== ""
          ? Number(item.hours)
          : commonData?.hours !== undefined && commonData?.hours !== ""
          ? Number(commonData.hours)
          : 0;
      const finalDescription = (item.description || commonData?.description || "").trim();

      if (!studentAddress || !finalTitle || !finalType) {
        continue;
      }

      const normalizedStudent = studentAddress.toLowerCase();

      // Upsert Student Profile
      const student = await prisma.student.upsert({
        where: { walletAddress: normalizedStudent },
        update: {
          fullName: studentName,
          identityNumber: item.identityNumber || undefined,
          career: item.career || undefined,
        },
        create: {
          walletAddress: normalizedStudent,
          fullName: studentName,
          identityNumber: item.identityNumber || null,
          career: item.career || "Sistemas Informáticos",
        },
      });

      // Calculate deterministic Keccak-256 metadata hash
      const metadataHash = generateMetadataHash({
        title: finalTitle,
        credentialType: finalType,
        studentAddress: normalizedStudent,
        studentName: student.fullName,
        issuerAddress: normalizedIssuer,
        issuerName: issuer.name,
        hours: finalHours,
        description: finalDescription,
        issuedAt: issuedAtIso,
      }) as `0x${string}`;

      // Create credential record in SQLite
      const credential = await prisma.credential.create({
        data: {
          credentialType: finalType,
          title: finalTitle,
          description: finalDescription || null,
          hours: finalHours > 0 ? finalHours : null,
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

      recipients.push(normalizedStudent);
      metadataHashes.push(metadataHash);

      createdRecords.push({
        id: credential.id,
        to: normalizedStudent,
        metadataHash,
        credentialType: finalType,
        title: credential.title,
        hours: credential.hours,
        studentName: student.fullName,
        identityNumber: student.identityNumber,
      });
    }

    const batchType = commonData?.credentialType || "CERTIFICATION";
    const enumVal =
      CREDENTIAL_TYPE_LABELS[batchType]?.enumVal ?? CredentialType.CERTIFICATION;

    return NextResponse.json(
      {
        success: true,
        data: {
          totalProcessed: createdRecords.length,
          recipients,
          metadataHashes,
          enumVal,
          records: createdRecords,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing batch credentials:", error);
    return NextResponse.json(
      { success: false, error: "Error al preparar el lote de credenciales" },
      { status: 500 }
    );
  }
}

// PATCH /api/credentials/batch - Confirm on-chain mint for batch records
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { updates, txHash } = body as {
      updates: Array<{ id: string; tokenId: number }>;
      txHash: string;
    };

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "updates array is required" },
        { status: 400 }
      );
    }

    const updatedRecords = [];

    for (const item of updates) {
      const updated = await prisma.credential.update({
        where: { id: item.id },
        data: {
          tokenId: item.tokenId,
          txHash: txHash || null,
          status: "ISSUED",
        },
        include: {
          student: true,
          issuer: true,
        },
      });

      updatedRecords.push({
        id: updated.id,
        tokenId: updated.tokenId,
        title: updated.title,
        studentName: updated.student?.fullName || "Estudiante",
        identityNumber: updated.student?.identityNumber,
        hours: updated.hours,
        to: updated.student?.walletAddress,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalProcessed: updatedRecords.length,
        records: updatedRecords,
      },
    });
  } catch (error) {
    console.error("Error confirming on-chain batch:", error);
    return NextResponse.json(
      { success: false, error: "Error al confirmar el lote on-chain" },
      { status: 500 }
    );
  }
}
