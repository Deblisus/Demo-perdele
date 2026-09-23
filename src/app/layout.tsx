import type { Metadata } from "next";
import { JetBrains_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
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
  title: "Perdele Shop",
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
      className={`${montserrat.variable} ${jetbrainsMono.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
