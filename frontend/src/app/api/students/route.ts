import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/students - List students (sanitized) or query full profile by walletAddress
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress")?.toLowerCase();

    if (walletAddress) {
      const student = await prisma.student.findUnique({
        where: { walletAddress },
        include: {
          credentials: {
            include: {
              issuer: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!student) {
        return NextResponse.json(
          { success: false, error: "Estudiante no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: student });
    }

    // Public list: Strip sensitive personal data (email, CI) to comply with data privacy
    const students = await prisma.student.findMany({
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        walletAddress: true,
        career: true,
        _count: {
          select: { credentials: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar estudiantes" },
      { status: 500 }
    );
  }
}

// POST /api/students - Register or update a student profile
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, fullName, email, identityNumber, career } = body;

    if (!walletAddress || !fullName) {
      return NextResponse.json(
        { success: false, error: "walletAddress y fullName son requeridos" },
        { status: 400 }
      );
    }

    const normalizedAddress = walletAddress.toLowerCase();

    const student = await prisma.student.upsert({
      where: { walletAddress: normalizedAddress },
      update: {
        fullName,
        email,
        identityNumber,
        career,
      },
      create: {
        walletAddress: normalizedAddress,
        fullName,
        email,
        identityNumber,
        career,
      },
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating student:", error);
    return NextResponse.json(
      { success: false, error: "Error al registrar estudiante" },
      { status: 500 }
    );
  }
}
