import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthCrossTabSync } from "@/components/AuthCrossTabSync";
import { RouteDocumentTitle } from "@/components/RouteDocumentTitle";
import { AppearancePreferenceBootstrap } from "@/components/AppearancePreferenceBootstrap";

export const metadata: Metadata = {
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`mobile-compact ${poppins.variable} ${inter.variable} bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AppearancePreferenceBootstrap />
          <RouteDocumentTitle />
          <AuthCrossTabSync />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
