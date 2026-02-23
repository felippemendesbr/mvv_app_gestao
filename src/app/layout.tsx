import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PwaProvider } from "@/components/PwaProvider";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "MVV App Gestão",
  description: "Sistema de gestão MVV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('mvv-theme');document.documentElement.classList.add(t==='dark'?'dark':'light')})()`,
          }}
        />
      </head>
      <body className={`${sourceSerif.variable} font-serif antialiased`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <PwaProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
