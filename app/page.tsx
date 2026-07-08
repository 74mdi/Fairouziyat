"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Album { id: number; name: string; cover_local: string | null; song_count: number; }
interface Stats { total_albums: number; total_songs: number; total_composers: number; total_maqamat: number; }

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.03, delayChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] } } };

function Cover({ album }: { album: Album }) {
  if (album.cover_local) {
    // cover_local is just the filename, e.g. "فيروز.jpg" — served statically from /public/covers/
    const filename = album.cover_local.includes("/") ? album.cover_local.split("/").pop()! : album.cover_local;
    return <img src={`/covers/${encodeURIComponent(filename)}`} alt={album.name} className="album-cover-img" loading="lazy" decoding="async" />;
  }
  return <div className="album-cover-fallback">{album.name.charAt(0)}</div>;
}

export default function Home() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/albums").then(r => r.json()),
      fetch("/api/stats").then(r => r.json()),
    ]).then(([a, s]) => { setAlbums(a); setStats(s); setLoading(false); });
    const saved = localStorage.getItem("fairouziyat-view");
    if (saved === "list" || saved === "grid") setView(saved as "grid" | "list");
  }, []);

  const setViewPref = (v: "grid" | "list") => {
    setView(v); localStorage.setItem("fairouziyat-view", v);
  };

  const filtered = search.trim() ? albums.filter(a => a.name.includes(search.trim())) : albums;

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim())
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="page">

      {/* Header */}
      <header className="home-header">
        <div className="home-header-side">
          <div className="view-toggle" role="group">
            <button className={`view-toggle-btn${view === "grid" ? " active" : ""}`} onClick={() => setViewPref("grid")} aria-label="شبكي">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="6" height="6" rx="1"/><rect x="8" y="0" width="6" height="6" rx="1"/><rect x="0" y="8" width="6" height="6" rx="1"/><rect x="8" y="8" width="6" height="6" rx="1"/></svg>
            </button>
            <button className={`view-toggle-btn${view === "list" ? " active" : ""}`} onClick={() => setViewPref("list")} aria-label="قائمة">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2" rx="1"/><rect x="0" y="6" width="14" height="2" rx="1"/><rect x="0" y="11" width="14" height="2" rx="1"/></svg>
            </button>
          </div>
        </div>

        <div className="home-header-center">
          <motion.h1
            className="site-title"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            فيروزيّات
          </motion.h1>
          <motion.p
            className="site-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            كلمات أغاني السيدة فيروز
          </motion.p>
        </div>

        <div className="home-header-side" style={{ justifyContent: "flex-end" }}>
          <ThemeToggle />
        </div>
      </header>

      {/* Search */}
      <motion.div
        className="search-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleKey}
          className="search-input"
          placeholder="ابحث عن ألبوم أو أغنية..."
        />
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div
          className="stats-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <span className="num">{stats.total_albums}</span><span>ألبوم</span>
          <span className="stats-sep">·</span>
          <span className="num">{stats.total_songs}</span><span>أغنية</span>
          {stats.total_composers > 0 && (
            <><span className="stats-sep">·</span><span className="num">{stats.total_composers}</span><span>ملحّن</span></>
          )}
        </motion.div>
      )}

      {loading && (
        <div className="loading-text">جاري التحميل…</div>
      )}

      {/* Grid / List */}
      {!loading && (
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            className={view === "grid" ? "album-grid" : "album-list"}
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {filtered.map(album => (
              <motion.div key={album.id} variants={item}>
                {view === "grid" ? (
                  <Link href={`/albums/${album.id}`} className="album-card">
                    <div className="album-cover-wrap">
                      <Cover album={album} />
                    </div>
                    <div className="album-info">
                      <div className="album-title">{album.name}</div>
                      <div className="album-count">{album.song_count} أغنية</div>
                    </div>
                  </Link>
                ) : (
                  <Link href={`/albums/${album.id}`} className="album-list-item">
                    <div className="album-list-cover"><Cover album={album} /></div>
                    <div className="album-list-info">
                      <div className="album-list-title">{album.name}</div>
                      <div className="album-list-count">{album.song_count} أغنية</div>
                    </div>
                    <span className="album-list-arrow">←</span>
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">لا نتائج لـ «{search}»</div>
      )}
    </div>
  );
}
