"use client";

import { useGameStore } from "@/store/game";
import { Chess } from "chess.js";

export default function GameOverOverlay() {
  const gameOver = useGameStore((s) => s.gameOver);
  const reset = useGameStore((s) => s.reset);

  if (!gameOver) return null;

  const iconMap: Record<string, string> = {
    checkmate: "♔",
    stalemate: "🤝",
    draw: "🤝",
    threefold: "🤝",
    insufficient: "🤝",
    fifty: "🤝",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-600 rounded-2xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
        <div className="text-6xl mb-4">{iconMap[gameOver.reason] ?? "♟"}</div>
        <h2 className="text-2xl font-bold text-white mb-2">ゲーム終了</h2>
        <p className="text-lg text-gray-300 mb-1">{gameOver.message}</p>
        {gameOver.winner && (
          <p className="text-blue-400 font-semibold mb-4">
            {gameOver.winner === "white" ? "⬜ 白の勝利" : "⬛ 黒の勝利"}
          </p>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
          >
            新しいゲーム
          </button>
        </div>
      </div>
    </div>
  );
}
