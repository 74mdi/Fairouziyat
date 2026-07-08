"use client";
import { usePlayer } from "@/contexts/PlayerContext";
import { Equalizer } from "@/components/Equalizer";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import Image from "next/image";

interface Song {
  id: number; title: string; album_id: number; track_number: number | null;
  maqam: string | null; audio_local: string | null; audio_opus: string | null; audio_m4a: string | null;
}
interface Album { id: number; name: string; cover_local: string | null; song_count: number; }

function albumCoverSrc(cover_local: string | null): string | null {
  if (!cover_local) return null;
  const filename = cover_local.includes("/") ? cover_local.split("/").pop()! : cover_local;
  return `/covers/${encodeURIComponent(filename)}`;
}

export default function AlbumClient({ data }: { data: { album: Album; songs: Song[] } }) {
  const { album, songs } = data;
  const { play, currentSong, isPlaying, pause, resume } = usePlayer();
  const coverSrc = albumCoverSrc(album.cover_local);

  return (
    <div className="page">
      <PageHeader crumbs={[{ label: "الرئيسية", href: "/" }, { label: album.name }]} />

      <div className="album-header">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}>
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={album.name}
              width={220}
              height={220}
              priority
              className="album-header-cover"
            />
          ) : (
            <div className="album-header-cover-fallback">{album.name.charAt(0)}</div>
          )}
        </motion.div>
        <motion.div className="album-header-meta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
          <h1 className="album-page-title">{album.name}</h1>
          <div className="album-page-count num">{album.song_count} <span style={{ fontFamily: "'Amiri',serif" }}>أغنية</span></div>
        </motion.div>
      </div>

      <div className="tracklist">
        {songs.map((song, idx) => {
          const isThis = currentSong?.id === song.id;
          const isThisPlaying = isThis && isPlaying;
          return (
            <motion.div key={song.id} className={`track-row${isThis ? " is-playing" : ""}`}
              initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.022 }}>
              <div className="track-num">
                <AnimatePresence mode="wait" initial={false}>
                  {isThis
                    ? <motion.div key="eq" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.18 }}><Equalizer paused={!isPlaying} /></motion.div>
                    : <motion.span key="num" className="num" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{song.track_number ?? idx + 1}</motion.span>}
                </AnimatePresence>
              </div>
              <button
                className={`track-play-btn${isThis ? " is-playing" : ""}`}
                onClick={() => {
                  const canPlay = song.audio_opus || song.audio_m4a;
                  if (!canPlay) return;
                  isThis ? (isThisPlaying ? pause() : resume()) : play(song, album.name, songs, idx, album.cover_local);
                }}
                aria-label={`تشغيل ${song.title}`}
                disabled={!song.audio_opus && !song.audio_m4a}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={isThisPlaying ? "pause" : "play"} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.12 }} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isThisPlaying
                      ? <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                      : <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" style={{ transform: "translateX(1px)" }}><path d="M8 5v14l11-7z"/></svg>
                    }
                  </motion.span>
                </AnimatePresence>
              </button>
              <Link href={`/songs/${song.id}`} className="track-title-link">
                <span>{song.title}</span>
                {song.maqam && <span className="maqam-badge">{song.maqam}</span>}
              </Link>
              <div />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
