import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH /api/credentials/[id] - Update token ID, transaction hash, or revocation status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tokenId, txHash, status, revokedReason } = body;

    const dataToUpdate: Record<string, unknown> = {};

    if (tokenId !== undefined) {
      dataToUpdate.tokenId = Number(tokenId);
    }
    if (txHash !== undefined) {
      dataToUpdate.txHash = txHash;
    }
    if (status !== undefined) {
      dataToUpdate.status = status;
      if (status === "REVOKED") {
        dataToUpdate.revokedAt = new Date();
        dataToUpdate.revokedReason = revokedReason || "Revocada por la institución emisora";
      }
    }

    const updated = await prisma.credential.update({
      where: { id },
      data: dataToUpdate,
      include: {
        issuer: true,
        student: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating credential:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar la credencial" },
      { status: 500 }
    );
  }
}

// GET /api/credentials/[id] - Get specific credential detail
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const credential = await prisma.credential.findUnique({
      where: { id },
      include: {
        issuer: true,
        student: true,
      },
    });

    if (!credential) {
      return NextResponse.json(
        { success: false, error: "Credencial no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: credential });
  } catch (error) {
    console.error("Error getting credential:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener la credencial" },
      { status: 500 }
    );
  }
}
