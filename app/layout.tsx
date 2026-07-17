import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"] });
const sans = Manrope({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return {
    metadataBase: new URL(origin),
    title: { default: "Lourdes Serpa — Contenido oficial", template: "%s · Lourdes Serpa" },
    description: "El espacio oficial de Lourdes Serpa: fotografía, video, colecciones y membresías exclusivas.",
    keywords: ["Lourdes Serpa", "contenido oficial", "colecciones", "membresía"],
    openGraph: { title: "Lourdes Serpa — Lo que no ves en ningún otro lugar", description: "Contenido editorial, colecciones y experiencias exclusivas.", type: "website", locale: "es_BO", images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "Lourdes Serpa — contenido oficial" }] },
    twitter: { card: "summary_large_image", title: "Lourdes Serpa", description: "Un universo sin filtros.", images: [`${origin}/og.png`] },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${display.variable} ${sans.variable}`}>{children}</body></html>;
}
