import type { Metadata } from "next";
import { Bodoni_Moda, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { centro } from "@/data/centro";
import "./globals.css";

/*
 * next/font descarga las tipografías al compilar y las sirve desde tu propio
 * dominio. Frente al <link> a Google Fonts de la maqueta: carga más rápido,
 * no salta el texto al aparecer la fuente, y no manda visitas a Google.
 */
const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${centro.nombreCompleto} — Baile, música y lengua de Galicia`,
    template: `%s · ${centro.nombreCompleto}`,
  },
  description:
    "Asociación cultural fundada en 1892. Baile tradicional, canto y pandereta, banda de gaitas y coro, cada semana en la calle Carretas de Madrid.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
