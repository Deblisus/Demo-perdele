import type { Metadata } from "next";
import { JetBrains_Mono, Montserrat, Newsreader } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Romanian diacritics (ă, ș, ț) live in latin-ext; without it they fall back
// to a system face mid-word.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
});

// Shop display face: headings, prices and the wordmark. Upright only.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  style: ["normal"],
});

// The admin ledger reads money, counts and order numbers in columns; a real
// mono with tabular figures is what makes those columns line up. `--font-mono`
// in globals.css pointed at an uninstalled Geist Mono, so this also repairs
// the `font-mono` utility for the rest of the app.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Perdele online",
  description: "Magazin online de perdele și draperii",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${montserrat.variable} ${newsreader.variable} ${jetbrainsMono.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
