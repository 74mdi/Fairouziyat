"use client";
import { motion } from "framer-motion";

export function Equalizer({ paused = false }: { paused?: boolean }) {
  const bars = [
    { delay: 0,    heights: [0.2, 1.0, 0.4, 0.85, 0.3] },
    { delay: 0.18, heights: [0.8, 0.3, 1.0, 0.4,  0.9] },
    { delay: 0.32, heights: [0.4, 0.9, 0.2, 1.0,  0.5] },
  ];
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: "2px", height: "14px", flexShrink: 0 }}>
      {bars.map((bar, i) => (
        <motion.span
          key={i}
          style={{ width: "2px", background: "var(--accent)", borderRadius: "1px", display: "block", transformOrigin: "bottom", height: "14px" }}
          animate={paused ? { scaleY: 0.2 } : { scaleY: bar.heights }}
          transition={paused ? { duration: 0.2 } : { duration: 0.6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: bar.delay }}
        />
      ))}
    </span>
  );
}
