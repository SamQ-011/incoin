import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CREDENTIAL_TYPE_LABELS } from "@/lib/metadata";

// GET /api/metadata/[tokenId] - Standard ERC-721 / OpenSea Metadata Endpoint for MetaMask
export async function GET(
  req: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    const parsedTokenId = parseInt(tokenId, 10);

    if (isNaN(parsedTokenId)) {
      return NextResponse.json(
        { error: "Invalid Token ID format" },
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

    const url = new URL(req.url);
    const hostUrl = `${url.protocol}//${url.host}`;
    const badgeImageUrl = `${hostUrl}/api/badges/${parsedTokenId}`;
    const verificationUrl = `${hostUrl}/verify/${parsedTokenId}`;

    if (!credential) {
      // Fallback for newly minted tokens or placeholder queries
      return NextResponse.json({
        name: `INCOIN Soulbound Credential #${parsedTokenId}`,
        description: `Credencial Académica Verificable e Intransferible emitida bajo el protocolo INCOIN (ERC-5192).`,
        image: badgeImageUrl,
        external_url: verificationUrl,
        attributes: [
          { trait_type: "Protocolo", value: "INCOIN" },
          { trait_type: "Estándar", value: "ERC-5192 Soulbound Token" },
          { trait_type: "Estado", value: "Verificado On-Chain" },
        ],
      });
    }

    const typeLabel =
      CREDENTIAL_TYPE_LABELS[credential.credentialType]?.label ||
      credential.credentialType;

    const metadata = {
      name: `${credential.title} #${String(credential.tokenId).padStart(6, "0")}`,
      description: `${credential.description || credential.title}. Emitida formalmente por ${
        credential.issuer?.name || "INCOS El Alto"
      } para ${
        credential.student?.fullName || "el estudiante"
      } bajo el estándar de credenciales académicas verificables Soulbound (ERC-5192).`,
      image: badgeImageUrl,
      external_url: verificationUrl,
      background_color: "0B132B",
      attributes: [
        {
          trait_type: "Institución Emisora",
          value: credential.issuer?.name || "INCOS El Alto",
        },
        {
          trait_type: "Sigla Institucional",
          value: credential.issuer?.shortName || "INCOS",
        },
        {
          trait_type: "Tipo de Credencial",
          value: typeLabel,
        },
        {
          trait_type: "Titular",
          value: credential.student?.fullName || "Estudiante",
        },
        {
          trait_type: "Cédula de Identidad",
          value: credential.student?.identityNumber || "Sin registro",
        },
        {
          trait_type: "Carrera / Programa",
          value: credential.student?.career || "Sistemas Informáticos",
        },
        {
          display_type: "number",
          trait_type: "Horas Académicas",
          value: credential.hours || 0,
        },
        {
          trait_type: "Intransferible (Soulbound)",
          value: "Sí (ERC-5192)",
        },
        {
          trait_type: "Estado",
          value: credential.status === "REVOKED" ? "Revocado" : "Válido y Auténtico",
        },
        {
          display_type: "date",
          trait_type: "Fecha de Emisión",
          value: Math.floor(new Date(credential.issueDate).getTime() / 1000),
        },
      ],
    };

    return NextResponse.json(metadata, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error serving ERC-721 metadata:", error);
    return NextResponse.json(
      { error: "Internal Server Error fetching metadata" },
      { status: 500 }
    );
  }
}
