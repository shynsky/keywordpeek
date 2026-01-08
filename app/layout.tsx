import type { Metadata } from "next";
import { Outfit, Manrope, Fira_Code } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KeywordPeek - Keyword Research Without the Subscription",
  description:
    "Pay-as-you-go keyword research for bootstrappers. Get volume, difficulty, and CPC data. 50 free lookups, no credit card required.",
  keywords: [
    "keyword research",
    "seo tool",
    "keyword tool",
    "search volume",
    "keyword difficulty",
    "bootstrappers",
    "indie hackers",
  ],
  authors: [{ name: "KeywordPeek" }],
  openGraph: {
    title: "KeywordPeek - Keyword Research Without the Subscription",
    description:
      "Pay-as-you-go keyword research for bootstrappers. 50 free lookups, no subscription.",
    url: "https://keywordpeek.com",
    siteName: "KeywordPeek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KeywordPeek - Keyword Research Without the Subscription",
    description:
      "Pay-as-you-go keyword research for bootstrappers. 50 free lookups, no subscription.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${outfit.variable} ${firaCode.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
