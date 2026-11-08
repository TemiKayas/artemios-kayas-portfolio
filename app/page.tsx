"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import GameMenu from "@/components/game/GameMenu";
import { hydrateGame } from "@/lib/game/state";

const World = dynamic(() => import("@/components/game/World"), { ssr: false });

export default function Home() {
  useEffect(hydrateGame, []);
  return (
    <div className="game">
      <World />
      <GameMenu />
    </div>
  );
}
