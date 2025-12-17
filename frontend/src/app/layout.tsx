import "./globals.css";
import { ReactNode } from "react";
import RootShell from "@/components/layout/RootShell";
import Script from "next/script";

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

        {/*Start of Tawk.to Script*/}
        <Script id="tawk-to" strategy="afterInteractive">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/694265f5131715197aa70c78/1jcllsiap';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
        {/*End of Tawk.to Script*/}
      </body>
    </html>
  );
}
