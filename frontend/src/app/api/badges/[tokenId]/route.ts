import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Color palettes and iconography per credential type
const BADGE_THEMES: Record<
  string,
  {
    gradientStart: string;
    gradientEnd: string;
    accentColor: string;
    glowColor: string;
    badgeLabel: string;
    iconSvg: string;
  }
> = {
  ACADEMIC_DEGREE: {
    gradientStart: "#D4AF37",
    gradientEnd: "#996515",
    accentColor: "#FFDF73",
    glowColor: "rgba(212, 175, 55, 0.4)",
    badgeLabel: "TÍTULO PROFESIONAL OFICIAL",
    iconSvg: `
      <polygon points="100,55 160,85 100,115 40,85" fill="#FFDF73" stroke="#996515" stroke-width="2"/>
      <polygon points="40,85 40,110 100,140 100,115" fill="#D4AF37"/>
      <polygon points="160,85 160,110 100,140 100,115" fill="#B38B22"/>
      <line x1="160" y1="95" x2="175" y2="125" stroke="#FFDF73" stroke-width="3"/>
      <circle cx="175" cy="130" r="5" fill="#FFDF73"/>
    `,
  },
  CERTIFICATION: {
    gradientStart: "#0072FF",
    gradientEnd: "#00C6FF",
    accentColor: "#70E1FF",
    glowColor: "rgba(0, 198, 255, 0.4)",
    badgeLabel: "CERTIFICACIÓN ACADÉMICA",
    iconSvg: `
      <circle cx="100" cy="95" r="35" fill="none" stroke="#70E1FF" stroke-width="4"/>
      <polygon points="100,75 107,89 122,89 110,99 114,113 100,103 86,113 90,99 78,89 93,89" fill="#70E1FF"/>
      <path d="M80,125 L70,150 L100,140 L130,150 L120,125" fill="#0072FF" stroke="#00C6FF" stroke-width="2"/>
    `,
  },
  VOLUNTEERING: {
    gradientStart: "#10B981",
    gradientEnd: "#047857",
    accentColor: "#6EE7B7",
    glowColor: "rgba(16, 185, 129, 0.4)",
    badgeLabel: "VOLUNTARIADO / IMPACTO SOCIAL",
    iconSvg: `
      <path d="M100,125 C100,125 65,95 65,75 C65,60 77,50 90,50 C96,50 100,54 100,54 C100,54 104,50 110,50 C123,50 135,60 135,75 C135,95 100,125 100,125 Z" fill="#6EE7B7" stroke="#047857" stroke-width="2"/>
      <path d="M85,130 L100,145 L115,130" stroke="#6EE7B7" stroke-width="3" fill="none" stroke-linecap="round"/>
    `,
  },
  INTERNSHIP: {
    gradientStart: "#8B5CF6",
    gradientEnd: "#5B21B6",
    accentColor: "#C4B5FD",
    glowColor: "rgba(139, 92, 246, 0.4)",
    badgeLabel: "PASANTÍA PROFESIONAL",
    iconSvg: `
      <rect x="65" y="70" width="70" height="50" rx="6" fill="#5B21B6" stroke="#C4B5FD" stroke-width="3"/>
      <path d="M85,70 V60 C85,55 90,52 95,52 H105 C110,52 115,55 115,60 V70" fill="none" stroke="#C4B5FD" stroke-width="3"/>
      <line x1="65" y1="88" x2="135" y2="88" stroke="#C4B5FD" stroke-width="2"/>
      <circle cx="100" cy="88" r="4" fill="#C4B5FD"/>
    `,
  },
  DIPLOMA: {
    gradientStart: "#F59E0B",
    gradientEnd: "#B45309",
    accentColor: "#FDE68A",
    glowColor: "rgba(245, 158, 11, 0.4)",
    badgeLabel: "DIPLOMADO DE ESPECIALIDAD",
    iconSvg: `
      <rect x="70" y="60" width="60" height="75" rx="4" fill="#B45309" stroke="#FDE68A" stroke-width="3"/>
      <line x1="80" y1="75" x2="120" y2="75" stroke="#FDE68A" stroke-width="2"/>
      <line x1="80" y1="90" x2="120" y2="90" stroke="#FDE68A" stroke-width="2"/>
      <line x1="80" y1="105" x2="110" y2="105" stroke="#FDE68A" stroke-width="2"/>
      <circle cx="115" cy="120" r="7" fill="#FDE68A"/>
    `,
  },
};

// GET /api/badges/[tokenId] -> Dynamic SVG Vector Badge Generator for MetaMask & Web3
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    const parsedId = parseInt(tokenId, 10);

    let title = "Credencial Académica INCOIN";
    let studentName = "Titular Académico";
    let hours = 50;
    let issuerName = "INCOS El Alto";
    let issuerShortName = "INCOS";
    let primaryColor = "#1E3A5F";
    let secondaryColor = "#D4AF37";
    let credType = "CERTIFICATION";
    let formattedTokenId = `#${String(isNaN(parsedId) ? 1 : parsedId).padStart(6, "0")}`;

    if (!isNaN(parsedId)) {
      const cred = await prisma.credential.findUnique({
        where: { tokenId: parsedId },
        include: { student: true, issuer: true },
      });

      if (cred) {
        title = cred.title;
        studentName = cred.student?.fullName || "Estudiante";
        hours = cred.hours || 0;
        issuerName = cred.issuer?.name || "INCOS El Alto";
        issuerShortName = cred.issuer?.shortName || "INCOS";
        primaryColor = cred.issuer?.primaryColor || "#1E3A5F";
        secondaryColor = cred.issuer?.secondaryColor || "#D4AF37";
        credType = cred.credentialType || "CERTIFICATION";
      }
    }

    const theme = BADGE_THEMES[credType] || BADGE_THEMES.CERTIFICATION;

    // Sanitize strings for SVG
    const safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeStudent = studentName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeIssuer = issuerName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeShortName = issuerShortName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <!-- Dynamic Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B132B"/>
      <stop offset="50%" stop-color="#152238"/>
      <stop offset="100%" stop-color="#080D1A"/>
    </linearGradient>

    <!-- Institutional Brand Gradient -->
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="${secondaryColor}"/>
    </linearGradient>

    <!-- Theme Badge Gradient -->
    <linearGradient id="themeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.gradientStart}"/>
      <stop offset="100%" stop-color="${theme.gradientEnd}"/>
    </linearGradient>

    <!-- Gold Laurel Gradient -->
    <linearGradient id="goldLaurel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFDF73"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#996515"/>
    </linearGradient>

    <!-- Glass Overlay Filter -->
    <filter id="badgeGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="${theme.glowColor}"/>
    </filter>

    <!-- Guilloche Security Pattern -->
    <pattern id="guilloche" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="15" r="14" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.75"/>
      <circle cx="15" cy="15" r="8" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="0.5"/>
    </pattern>
  </defs>

  <!-- Base Card Background -->
  <rect x="15" y="15" width="570" height="570" rx="36" fill="url(#bgGrad)" stroke="url(#themeGrad)" stroke-width="3"/>
  <rect x="25" y="25" width="550" height="550" rx="28" fill="url(#guilloche)"/>

  <!-- Inner Double Border -->
  <rect x="28" y="28" width="544" height="544" rx="26" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- Top Header Banner with Dynamic Institution Branding -->
  <g transform="translate(0, 45)">
    <!-- Institutional Logo Crest Seal -->
    <circle cx="300" cy="25" r="22" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="2"/>
    <text x="300" y="30" font-family="'Segoe UI', -apple-system, Roboto, sans-serif" font-size="${safeShortName.length > 6 ? '9' : '11'}" font-weight="900" fill="${secondaryColor}" text-anchor="middle" letter-spacing="1">
      ${safeShortName.toUpperCase()}
    </text>

    <!-- Institution Full Name -->
    <text x="300" y="65" font-family="'Segoe UI', -apple-system, Roboto, sans-serif" font-size="12" font-weight="800" fill="#E2E8F0" text-anchor="middle" letter-spacing="1.5">
      ${safeIssuer.length > 45 ? safeIssuer.substring(0, 43) + "..." : safeIssuer.toUpperCase()}
    </text>
    <text x="300" y="80" font-family="'Segoe UI', -apple-system, Roboto, sans-serif" font-size="9" font-weight="600" fill="#94A3B8" text-anchor="middle" letter-spacing="3">
      RED NACIONAL DE CREDENCIALES SOULBOUND (INCOIN)
    </text>
  </g>

  <!-- Central Medal & Icon -->
  <g transform="translate(200, 155)" filter="url(#badgeGlow)">
    <!-- Laurel Wreath Circle -->
    <circle cx="100" cy="95" r="70" fill="#0A1120" stroke="url(#themeGrad)" stroke-width="4"/>
    <circle cx="100" cy="95" r="58" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" stroke-dasharray="4 3"/>

    <!-- Theme Icon -->
    ${theme.iconSvg}
  </g>

  <!-- Category Tag -->
  <g transform="translate(300, 360)">
    <rect x="-130" y="-12" width="260" height="24" rx="12" fill="url(#themeGrad)" opacity="0.9"/>
    <text x="0" y="4" font-family="'Segoe UI', -apple-system, Roboto, sans-serif" font-size="10" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">${theme.badgeLabel}</text>
  </g>

  <!-- Credential Title -->
  <text x="300" y="415" font-family="'Segoe UI', -apple-system, Roboto, sans-serif" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">
    ${safeTitle.length > 40 ? safeTitle.substring(0, 38) + "..." : safeTitle}
  </text>

  <!-- Student Name -->
  <text x="300" y="445" font-family="'Segoe UI', -apple-system, Roboto, sans-serif" font-size="14" font-weight="600" fill="${theme.accentColor}" text-anchor="middle">
    Titular: ${safeStudent}
  </text>

  <!-- Bottom Metadata Pills -->
  <g transform="translate(60, 480)">
    <!-- Hours Pill -->
    <rect x="0" y="0" width="140" height="34" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <text x="70" y="21" font-family="'Segoe UI', -apple-system, Roboto, sans-serif" font-size="11" font-weight="700" fill="#E2E8F0" text-anchor="middle">⏱️ ${hours} Horas Valid.</text>

    <!-- Token ID Pill -->
    <rect x="170" y="0" width="140" height="34" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <text x="240" y="21" font-family="'Courier New', monospace" font-size="12" font-weight="800" fill="#FFDF73" text-anchor="middle">${formattedTokenId}</text>

    <!-- Soulbound Lock Pill -->
    <rect x="340" y="0" width="140" height="34" rx="10" fill="rgba(255,255,255,0.05)" stroke="url(#themeGrad)" stroke-width="1"/>
    <text x="410" y="21" font-family="'Segoe UI', -apple-system, Roboto, sans-serif" font-size="10" font-weight="800" fill="${theme.accentColor}" text-anchor="middle">🔒 ERC-5192 SBT</text>
  </g>

  <!-- Bottom Verification Footer -->
  <text x="300" y="550" font-family="'Segoe UI', -apple-system, Roboto, sans-serif" font-size="9" font-weight="600" fill="#64748B" text-anchor="middle" letter-spacing="1">
    VERIFICABLE PÚBLICAMENTE EN INCOIN PROTOCOL • INMUTABLE ON-CHAIN
  </text>
</svg>
    `.trim();

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error generating SVG badge:", error);
    return new NextResponse("<svg><text>Error generating badge</text></svg>", {
      status: 500,
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}
