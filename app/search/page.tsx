"use client";
import { useState, useEffect, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

interface SearchSong { id: number; title: string; lyricist: string | null; composer: string | null; album_name: string; album_id: number; }
interface Album { id: number; name: string; cover_local: string | null; song_count: number; }

function hl(text: string, term: string) {
  if (!term) return <>{text}</>;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return <>{parts.map((p, i) => p.toLowerCase() === term.toLowerCase() ? <mark key={i}>{p}</mark> : p)}</>;
}

const li = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.22 } } };

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const router = useRouter();
  const [results, setResults] = useState<{ songs: SearchSong[]; albums: Album[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) { setResults(null); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r => r.json()).then(d => { setResults(d); setLoading(false); });
  }, [q]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nq = (new FormData(e.currentTarget).get("q") as string).trim();
    if (nq) router.push(`/search?q=${encodeURIComponent(nq)}`);
  };

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link href="/">الرئيسية</Link>
        <span className="breadcrumb-sep">/</span>
        <span>بحث</span>
      </nav>
      <div className="search-wrap" style={{ marginBottom: 48 }}>
        <form onSubmit={handleSearch} style={{ width: "100%", maxWidth: 480 }}>
          <input type="text" name="q" defaultValue={q} key={q} className="search-input" placeholder="ابحث عن أغنية أو ألبوم..." autoFocus />
        </form>
      </div>
      {loading && <div style={{ textAlign: "center", color: "var(--ink-3)", fontSize: 15 }}>جاري البحث</div>}
      {results && results.songs.length === 0 && results.albums.length === 0 && (
        <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>لا نتائج لـ «{q}»</motion.div>
      )}
      {results && results.songs.length > 0 && (
        <div className="results-section">
          <h2 className="results-heading">أغاني</h2>
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }}>
            {results.songs.map(song => (
              <motion.div key={song.id} variants={li}>
                <Link href={`/songs/${song.id}`} className="result-song-row">
                  <div className="result-song-title">{hl(song.title, q)}</div>
                  <div className="result-song-sub">{hl(song.album_name, q)}{song.lyricist && <span> · كلمات: {hl(song.lyricist, q)}</span>}{song.composer && <span> · ألحان: {hl(song.composer, q)}</span>}</div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
      {results && results.albums.length > 0 && (
        <div className="results-section">
          <h2 className="results-heading">ألبومات</h2>
          <motion.div className="album-grid" style={{ marginTop: 16 }} initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
            {results.albums.map(album => (
              <motion.div key={album.id} variants={li}>
                <Link href={`/albums/${album.id}`} className="album-card">
                  <div className="album-cover-wrap">
                    {album.cover_local ? (
                      <img
                        src={`/covers/${encodeURIComponent(
                          album.cover_local.includes("/") ? album.cover_local.split("/").pop()! : album.cover_local
                        )}`}
                        alt={album.name}
                        className="album-cover-img"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="album-cover-fallback">{album.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="album-info">
                    <div className="album-title">{hl(album.name, q)}</div>
                    <div className="album-count num">{album.song_count} <span style={{ fontFamily: "'Amiri',serif" }}>أغنية</span></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div className="page" style={{ textAlign: "center", color: "var(--ink-2)" }}>جاري التحميل</div>}><SearchContent /></Suspense>;
}
