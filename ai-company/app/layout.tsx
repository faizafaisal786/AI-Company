import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Company — Multi-Agent Startup Builder",
  description: "Build your startup with AI agents: CEO, Research, Developer, Designer, Marketing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased bg-[#050510] text-slate-200">
        {children}
      </body>
    </html>
  );
}
