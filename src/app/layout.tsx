import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MUNVault — AI-Powered MUN Command Center & Archive",
  description:
    "Dark-mode, full-stack personal MUN knowledge and performance management system. Immutable document archive, AI research scoring, cross-conference speech analysis, and voice-based training.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-vault-bg text-vault-text min-h-screen selection:bg-vault-coral selection:text-white">
        {children}
      </body>
    </html>
  );
}
