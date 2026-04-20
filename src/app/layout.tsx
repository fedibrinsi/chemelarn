import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";
import { Toaster } from "sonner";

import anprLogo from "../../assets/anpr-05.png";
import eu4YouthLogo from "../../assets/eu4youth-03.png";
import fundedByEuLogo from "../../assets/funded by eu_Plan de travail 1.png";
import innoscenceLogo from "../../assets/innoscence LOGO FINAL.png";
import swafyLogo from "../../assets/logo 150-04.png";
import amisLogo from "../../assets/Logo AMIS.png";
import aticLogo from "../../assets/LOGO ATIC.jpg";
import ueLogo from "../../assets/ue_Plan de travail 1.png";

export const metadata: Metadata = {
  title: "ChemLearn Exam Lab",
  description: "Online exams and chemistry-inspired learning for schools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logos = [
    { src: aticLogo, alt: "ATIC Tunisian Federation of Chemists", size: "h-12" },
    { src: swafyLogo, alt: "Swafy", size: "h-12" },
    { src: anprLogo, alt: "ANPR", size: "h-12" },
    { src: eu4YouthLogo, alt: "EU4Youth", size: "h-12" },
    { src: fundedByEuLogo, alt: "Funded by the European Union", size: "h-12" },
    { src: ueLogo, alt: "Delegation of the European Union in Tunisia", size: "h-12" },
    { src: amisLogo, alt: "AMIS", size: "h-12" },
    { src: innoscenceLogo, alt: "Innoscence", size: "h-12" },
  ];

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex min-h-full flex-col">
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[var(--line)] bg-white/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-6 px-6 py-6">
              {logos.map((logo) => (
                <Image
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  className={`${logo.size} w-auto object-contain opacity-90 transition-opacity duration-300 hover:opacity-100`}
                  sizes="(max-width: 768px) 40vw, 180px"
                />
              ))}
            </div>
          </footer>
        </div>
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            classNames: {
              toast: "border border-white/60 bg-white/95 shadow-lg",
            },
          }}
        />
      </body>
    </html>
  );
}
