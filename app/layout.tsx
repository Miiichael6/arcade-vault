import type { Metadata } from "next";
import { Press_Start_2P, JetBrains_Mono, Courier_Prime } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono-primary",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-mono-fallback",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arcade Vault",
  description: "Plataforma retro para jugar minijuegos y competir en el Salón de la Fama.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${pixelFont.variable} ${monoFont.variable} ${courierPrime.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <div className="av-bg" />
        <div className="av-noise" />
        <div id="root">
          <main className="av-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
