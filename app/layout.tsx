import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import Link from "next/link";
import { PlayerBarWrapper } from "@/components/PlayerBarWrapper";
import { Amiri, EB_Garamond } from "next/font/google";

// Self-hosted via next/font — eliminates the render-blocking Google Fonts request
const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-amiri",
  display: "swap",
  preload: true,
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
  preload: false, // numbers font, not LCP-critical
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fairouziyat.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "فيروزيّات — كلمات أغاني فيروز",
    template: "%s | فيروزيّات",
  },
  description:
    "أرشيف شامل لكلمات أغاني السيدة فيروز — تصفّح أكثر من 800 أغنية مع الكلمات والملحنين ومعلومات المقامات الموسيقية. مفتوح المصدر ومجاني للجميع.",
  keywords: [
    "فيروز", "كلمات أغاني فيروز", "fairouziyat", "fairuz lyrics",
    "أغاني فيروز", "الرحابنة", "فيروزيات", "كلمات",
  ],
  authors: [{ name: "7amdi", url: "https://7amdi.vercel.app" }],
  creator: "7amdi",
  publisher: "فيروزيّات",
  category: "music",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    url: SITE_URL,
    siteName: "فيروزيّات",
    title: "فيروزيّات — كلمات أغاني فيروز",
    description:
      "أرشيف شامل لكلمات أغاني السيدة فيروز — تصفّح أكثر من 800 أغنية مع الكلمات والملحنين.",
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "فيروزيّات — كلمات أغاني فيروز",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "فيروزيّات — كلمات أغاني فيروز",
    description: "أرشيف شامل لكلمات أغاني السيدة فيروز — تصفّح أكثر من 800 أغنية.",
    images: [`${SITE_URL}/og-default.jpg`],
    creator: "@7amdi",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${amiri.variable} ${ebGaramond.variable}`}>
      <head>
        {/* Blocking script: runs before first paint to eliminate dark-mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('fairouziyat-theme');var t=s==='dark'||s==='light'?s:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        {/* PWA / icon hints */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <ThemeProvider>
          <PlayerProvider>
            {/* min-height reserves space so footer doesn't shift when player bar appears */}
            <div className="layout-shell">
              <main>
                {children}
              </main>
              <footer className="site-footer">
                <div className="site-footer-inner">
                  <Link href="/about" className="footer-link">عن الموقع والـ API</Link>
                  <span className="footer-sep">·</span>
                  <a href="https://7amdi.vercel.app" target="_blank" rel="noopener noreferrer" className="footer-link footer-author">
                    @7amdi
                  </a>
                </div>
              </footer>
            </div>
            <PlayerBarWrapper />
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
