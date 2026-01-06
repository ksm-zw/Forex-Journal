import type { Metadata } from "next";
import { ThemeProvider } from "@/context/ThemeContext";
import AppShell from '@/components/AppShell';
import "./globals.css";

export const metadata: Metadata = {
  title: "Young Money Trading Journal",
  description: "Professional Forex Trading Journal & Portfolio Tracker",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          html {
            color-scheme: dark;
          }
        `}</style>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}>
        <div className="trader-background"><div className="trader-lines" /></div>
        <ThemeProvider>
          <AppShell>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
