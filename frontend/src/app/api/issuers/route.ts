import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/issuers - List all registered/authorized issuers with stats
export async function GET() {
  try {
    const issuers = await prisma.issuer.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: { credentials: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: issuers });
  } catch (error) {
    console.error("Error fetching issuers:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener instituciones emisoras" },
      { status: 500 }
    );
  }
}

// POST /api/issuers - Register or update an institutional member
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      walletAddress,
      name,
      shortName,
      type,
      description,
      website,
      logoUrl,
      primaryColor,
      secondaryColor,
      city,
      country,
      txHash,
      isAuthorized,
    } = body;

    if (!walletAddress || !name) {
      return NextResponse.json(
        { success: false, error: "walletAddress y name son campos obligatorios" },
        { status: 400 }
      );
    }

    const normalizedAddress = walletAddress.toLowerCase();

    const issuer = await prisma.issuer.upsert({
      where: { walletAddress: normalizedAddress },
      update: {
        name,
        shortName: shortName || name,
        type: type || "INSTITUTO_TECNICO",
        description: description || undefined,
        website: website || undefined,
        logoUrl: logoUrl || undefined,
        primaryColor: primaryColor || undefined,
        secondaryColor: secondaryColor || undefined,
        city: city || undefined,
        country: country || undefined,
        txHash: txHash || undefined,
        isAuthorized: isAuthorized !== undefined ? isAuthorized : true,
      },
      create: {
        walletAddress: normalizedAddress,
        name,
        shortName: shortName || name,
        type: type || "INSTITUTO_TECNICO",
        description: description || null,
        website: website || null,
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || "#1E3A5F",
        secondaryColor: secondaryColor || "#D4AF37",
        city: city || "El Alto, La Paz",
        country: country || "Bolivia",
        txHash: txHash || null,
        isAuthorized: isAuthorized !== undefined ? isAuthorized : true,
      },
    });

    return NextResponse.json({ success: true, data: issuer }, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating issuer:", error);
    return NextResponse.json(
      { success: false, error: "Error al registrar institución emisora" },
      { status: 500 }
    );
  }
}
