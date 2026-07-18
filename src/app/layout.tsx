import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

export const metadata: Metadata = {
  title: "খুলনা গেজেট | Khulna Gazette - খবরের অন্তরালে খবর",
  description: "খুলনা অঞ্চল ও জাতীয় এবং আন্তর্জাতিক সর্বশেষ সংবাদ নিয়ে খুলনা গেজেট।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className={`${hindSiliguri.variable} font-sans bg-gray-50 text-gray-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
