"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "@/contexts/PlayerContext";
import { Equalizer } from "./Equalizer";
import Link from "next/link";

function fmt(t: number) {
  if (!isFinite(t) || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function VolumeIcon({ level }: { level: number }) {
  if (level === 0) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  if (level < 0.5) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

export function PlayerBar() {
  const { currentSong, albumName, isPlaying, pause, resume, next, prev, progress, duration, seek, volume, setVolume } = usePlayer();
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {currentSong && (
        <motion.div
          className="player-bar-container"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
        >
          <div className="player-bar">
            {/* Inner controls layout */}
            <div className="player-inner">
              
              {/* Left section: Song Details & Equalizer */}
              <div className="player-info">
                <div className="player-song-title">
                  <Equalizer paused={!isPlaying} />
                  <Link href={`/songs/${currentSong.id}`} className="player-title-link">
                    {currentSong.title}
                  </Link>
                </div>
                <div className="player-album-name">{albumName}</div>
              </div>

              {/* Middle section: Main playback controls */}
              <div className="player-controls-container">
                <div className="player-controls">
                  <button onClick={prev} className="player-btn" aria-label="السابق">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={isPlaying ? pause : resume}
                    className="player-btn player-btn-main"
                    aria-label={isPlaying ? "إيقاف" : "تشغيل"}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={isPlaying ? "pause" : "play"}
                        initial={{ scale: 0.8, opacity: 0, rotate: isPlaying ? -45 : 45 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.8, opacity: 0, rotate: isPlaying ? 45 : -45 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        {isPlaying ? (
                          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ transform: "translateX(-1px)" }}>
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </button>

                  <button onClick={next} className="player-btn" aria-label="التالي">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                    </svg>
                  </button>
                </div>

                {/* Progress bar centered under controls */}
                <div className="player-progress-container">
                  <span className="player-time num">{fmt(progress)}</span>
                  <div className="player-progress-track" onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    seek(((e.clientX - rect.left) / rect.width) * duration);
                  }}>
                    <div className="player-progress-fill" style={{ width: `${pct}%` }} />
                    <div className="player-progress-thumb" style={{ left: `${pct}%` }} />
                  </div>
                  <span className="player-time num">{fmt(duration)}</span>
                </div>
              </div>

              {/* Right section: Volume Control */}
              <div className="player-volume">
                <VolumeIcon level={volume} />
                <input
                  type="range" min={0} max={1} step={0.02} value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="player-volume-range"
                  aria-label="مستوى الصوت"
                />
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
