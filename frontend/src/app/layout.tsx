import "./globals.css";
import { ReactNode } from "react";
import RootShell from "@/components/layout/RootShell";

export const metadata = {
  title: "ApexGlobalEarnings | Smart Trading & Investment",
  description: "Premium trading investment platform for crypto, indices & metals.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ❗ No bg-bg here anymore – each shell controls its own background */}
      <body className="antialiased">
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
