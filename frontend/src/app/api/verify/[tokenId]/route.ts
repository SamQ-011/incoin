import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/verify/[tokenId] - Public verification endpoint for a credential
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    const parsedTokenId = parseInt(tokenId, 10);

    if (isNaN(parsedTokenId)) {
      return NextResponse.json(
        { success: false, error: "ID de credencial inválido" },
        { status: 400 }
      );
    }

    const credential = await prisma.credential.findUnique({
      where: { tokenId: parsedTokenId },
      include: {
        issuer: true,
        student: true,
      },
    });

    if (!credential) {
      return NextResponse.json(
        {
          success: false,
          error: "Credencial no registrada en la base de datos",
          found: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      found: true,
      data: {
        tokenId: credential.tokenId,
        txHash: credential.txHash,
        title: credential.title,
        description: credential.description,
        credentialType: credential.credentialType,
        hours: credential.hours,
        metadataHash: credential.metadataHash,
        issueDate: credential.issueDate,
        status: credential.status,
        revoked: credential.status === "REVOKED",
        revokedAt: credential.revokedAt,
        revokedReason: credential.revokedReason,
        isSoulbound: true,
        issuer: {
          name: credential.issuer.name,
          shortName: credential.issuer.shortName,
          type: credential.issuer.type,
          walletAddress: credential.issuer.walletAddress,
          isAuthorized: credential.issuer.isAuthorized,
        },
        student: {
          fullName: credential.student.fullName,
          identityNumber: credential.student.identityNumber,
          career: credential.student.career,
          walletAddress: credential.student.walletAddress,
        },
      },
    });
  } catch (error) {
    console.error("Error verifying credential:", error);
    return NextResponse.json(
      { success: false, error: "Error en la consulta de verificación" },
      { status: 500 }
    );
  }
}
