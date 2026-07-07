import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { PlayerBar } from "@/components/PlayerBar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "فيروزيّات",
  description: "كلمات أغاني السيدة فيروز — أرشيف مفتوح",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Blocking script: runs before first paint to eliminate dark-mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('fairouziyat-theme');var t=s==='dark'||s==='light'?s:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <PlayerProvider>
            {children}
            <footer className="site-footer">
              <div className="site-footer-inner">
                <Link href="/about" className="footer-link">عن الموقع والـ API</Link>
                <span className="footer-sep">·</span>
                <a href="https://7amdi.vercel.app" target="_blank" rel="noopener noreferrer" className="footer-link footer-author">
                  @7amdi
                </a>
              </div>
            </footer>
            <PlayerBar />
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
