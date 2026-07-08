"use client";
import dynamic from "next/dynamic";

const PlayerBar = dynamic(() => import("./PlayerBar").then(mod => mod.PlayerBar), {
  ssr: false,
});

export function PlayerBarWrapper() {
  return <PlayerBar />;
}
