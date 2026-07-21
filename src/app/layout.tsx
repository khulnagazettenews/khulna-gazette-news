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
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }
    ]
  },
  manifest: '/site.webmanifest'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${hindSiliguri.variable} font-sans bg-gray-50 text-gray-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
