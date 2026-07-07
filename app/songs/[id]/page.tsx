"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "@/contexts/PlayerContext";
import { PageHeader } from "@/components/PageHeader";

interface SongDetail { id: number; title: string; album_id: number; album_name: string; lyricist: string | null; composer: string | null; maqam: string | null; lyrics: string | null; audio_local: string | null; audio_opus: string | null; audio_m4a: string | null; prev_id: number | null; next_id: number | null; }

export default function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [song, setSong] = useState<SongDetail | null>(null);
  const { play, currentSong, isPlaying, pause, resume } = usePlayer();

  useEffect(() => {
    fetch(`/api/songs/${id}`).then(r => r.json()).then(setSong);
  }, [id]);

  if (!song) return <div className="page" style={{ textAlign: "center", color: "var(--ink-2)" }}>جاري التحميل</div>;

  const isThis = currentSong?.id === song.id;
  const isThisPlaying = isThis && isPlaying;

  const handlePlay = () => {
    const canPlay = song.audio_opus || song.audio_m4a;
    if (!canPlay) return;
    if (isThis) { isThisPlaying ? pause() : resume(); }
    else { play(song, song.album_name, [song], 0); }
  };

  return (
    <div className="page">
      <PageHeader crumbs={[
        { label: "الرئيسية", href: "/" },
        { label: song.album_name, href: `/albums/${song.album_id}` },
        { label: song.title },
      ]} />

      <motion.div className="song-header" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="song-title">{song.title}</h1>
        <div className="song-meta">
          {song.lyricist && <span>كلمات: {song.lyricist}</span>}
          {song.composer && <span>ألحان: {song.composer}</span>}
        </div>
        {song.maqam && <div style={{ marginBottom: 16 }}><span className="maqam-badge">مقام {song.maqam}</span></div>}
        {(song.audio_opus || song.audio_m4a) && (
          <button
            className={`song-play-btn${isThisPlaying ? " playing" : ""}`}
            onClick={handlePlay}
            aria-label={isThisPlaying ? "إيقاف مؤقت" : "تشغيل"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isThisPlaying ? "pause" : "play"}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}
              >
                {isThisPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{ transform: "translateX(1px)" }}>
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        )}
      </motion.div>

      {song.lyrics && (
        <motion.div className="lyrics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
          {song.lyrics.split("\n\n").map((stanza, idx) => (
            <motion.p key={idx} className="lyrics-stanza"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12 + idx * 0.05 }}>
              {stanza}
            </motion.p>
          ))}
        </motion.div>
      )}

      <div className="song-nav">
        {song.next_id ? <Link href={`/songs/${song.next_id}`}>← التالية</Link> : <div />}
        {song.prev_id ? <Link href={`/songs/${song.prev_id}`}>السابقة →</Link> : <div />}
      </div>
    </div>
  );
}
