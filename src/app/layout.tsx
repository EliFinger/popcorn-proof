import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Popcorn Proof",
  description: "A zero-token onchain cinema ritual mini app on Base.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="base:app_id"
          content="6a252f3a95cfa95c11629bb3"
        />
        <meta
          name="talentapp:project_verification"
          content="03e0b8882cdd5b98a4a3669a3d421f7cc438e312c8ea833f1e3aa8d89f0d8df7d8322f3390e139bb50c53ad2d7b48b3724ccd22943fe637f16421a8e3734b7c4"
        />
      </head>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
