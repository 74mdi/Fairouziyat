"use client";
import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from "react";

export interface Song {
  id: number; title: string; album_id: number;
  audio_local: string | null; audio_opus: string | null; audio_m4a: string | null;
  cover_local?: string | null;
}

interface PlayerState {
  currentSong: Song | null; albumName: string; isPlaying: boolean;
  progress: number; duration: number; volume: number;
  play: (song: Song, albumName: string, queue: Song[], index: number, cover?: string | null) => void;
  pause: () => void; resume: () => void; next: () => void; prev: () => void;
  seek: (t: number) => void; setVolume: (v: number) => void;
}

const PlayerContext = createContext<PlayerState | undefined>(undefined);

const STORAGE_KEY = "fairouziyat-player";

function saveState(song: Song, albumName: string, time: number, albumCover?: string | null) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ song, albumName, time, albumCover }));
  } catch {}
}

function loadState(): { song: Song; albumName: string; time: number; albumCover?: string | null } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [albumName, setAlbumName] = useState("");
  const [albumCover, setAlbumCover] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<Song[]>([]);
  const indexRef = useRef(0);
  const resumeTimeRef = useRef<number | null>(null);

  // Keep refs in sync so the timeupdate closure can access current values
  const currentSongRef = useRef<Song | null>(null);
  const albumNameRef = useRef("");
  const albumCoverRef = useRef<string | null>(null);

  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
  useEffect(() => { albumNameRef.current = albumName; }, [albumName]);
  useEffect(() => { albumCoverRef.current = albumCover; }, [albumCover]);

  const loadSong = useCallback((song: Song, idx: number) => {
    const src = song.audio_opus || song.audio_m4a;
    if (!audioRef.current || !src) return;
    indexRef.current = idx;
    setCurrentSong(song);
    audioRef.current.src = src;
    audioRef.current.play().catch(console.error);
  }, []);

  const play = useCallback((song: Song, name: string, queue: Song[], idx: number, cover?: string | null) => {
    queueRef.current = queue;
    setAlbumName(name);
    albumNameRef.current = name;
    setAlbumCover(cover ?? song.cover_local ?? null);
    albumCoverRef.current = cover ?? song.cover_local ?? null;
    loadSong(song, idx);
  }, [loadSong]);

  const pause = useCallback(() => audioRef.current?.pause(), []);
  const resume = useCallback(() => audioRef.current?.play().catch(console.error), []);
  
  const next = useCallback(() => {
    const n = indexRef.current + 1;
    if (n < queueRef.current.length) loadSong(queueRef.current[n], n);
  }, [loadSong]);

  const prev = useCallback(() => {
    const p = indexRef.current - 1;
    if (p >= 0) loadSong(queueRef.current[p], p);
  }, [loadSong]);

  const seek = useCallback((t: number) => {
    if (audioRef.current) { audioRef.current.currentTime = t; setProgress(t); }
  }, []);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) { audioRef.current.volume = v; setVolumeState(v); }
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.addEventListener("timeupdate", () => {
      setProgress(audio.currentTime);
      // persist position every ~5s
      if (Math.floor(audio.currentTime) % 5 === 0 && currentSongRef.current) {
        saveState(currentSongRef.current, albumNameRef.current, audio.currentTime, albumCoverRef.current);
      }
    });
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", () => {
      const nextIdx = indexRef.current + 1;
      if (nextIdx < queueRef.current.length) loadSong(queueRef.current[nextIdx], nextIdx);
    });

    // Restore last session
    const saved = loadState();
    const savedSrc = saved?.song?.audio_opus || saved?.song?.audio_m4a;
    if (saved?.song && savedSrc) {
      setCurrentSong(saved.song);
      setAlbumName(saved.albumName);
      if (saved.albumCover) {
        setAlbumCover(saved.albumCover);
        albumCoverRef.current = saved.albumCover;
      }
      resumeTimeRef.current = saved.time;
      audio.src = savedSrc;
      audio.load();
      audio.addEventListener("canplay", function onCanPlay() {
        audio.removeEventListener("canplay", onCanPlay);
        if (resumeTimeRef.current !== null) {
          audio.currentTime = resumeTimeRef.current;
          setProgress(resumeTimeRef.current);
          resumeTimeRef.current = null;
        }
      }, { once: true });
    }

    return () => { audio.pause(); audio.src = ""; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Media Session Metadata
  useEffect(() => {
    if (!currentSong || typeof window === "undefined" || !("mediaSession" in navigator)) return;

    const filename = albumCover
      ? (albumCover.includes("/") ? albumCover.split("/").pop()! : albumCover)
      : null;
    const artworkUrl = filename
      ? `${window.location.origin}/covers/${encodeURIComponent(filename)}`
      : `${window.location.origin}/og-default.jpg`;

    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentSong.title,
        artist: "السيدة فيروز",
        album: albumName || "فيروزيّات",
        artwork: [
          { src: artworkUrl, sizes: "96x96" },
          { src: artworkUrl, sizes: "128x128" },
          { src: artworkUrl, sizes: "192x192" },
          { src: artworkUrl, sizes: "256x256" },
          { src: artworkUrl, sizes: "384x384" },
          { src: artworkUrl, sizes: "512x512" }
        ],
      });
    } catch (e) {
      console.warn("Failed to set MediaSession metadata:", e);
    }
  }, [currentSong, albumName, albumCover]);

  // Update Media Session Position State
  useEffect(() => {
    if (!currentSong || typeof window === "undefined" || !("mediaSession" in navigator) || !("setPositionState" in navigator.mediaSession)) return;

    try {
      navigator.mediaSession.setPositionState({
        duration: duration || 0,
        playbackRate: 1.0,
        position: progress || 0
      });
    } catch (e) {
      console.warn("Failed to set MediaSession position state:", e);
    }
  }, [currentSong, duration, progress]);

  // Update Media Session Action Handlers
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler("play", resume);
      navigator.mediaSession.setActionHandler("pause", pause);
      navigator.mediaSession.setActionHandler("previoustrack", prev);
      navigator.mediaSession.setActionHandler("nexttrack", next);
      
      // Support lockscreen seeking/scrubbing
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.fastSeek && audioRef.current) {
          audioRef.current.currentTime = details.seekTime || 0;
        } else {
          seek(details.seekTime || 0);
        }
      });
    } catch (e) {
      console.warn("Failed to set MediaSession action handlers:", e);
    }

    return () => {
      if (!("mediaSession" in navigator)) return;
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("seekto", null);
    };
  }, [resume, pause, prev, next, seek]);

  return (
    <PlayerContext.Provider value={{ currentSong, albumName, isPlaying, progress, duration, volume, play, pause, resume, next, prev, seek, setVolume }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
