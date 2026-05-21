"use client";

import { useGameStore } from "@/store/game";

export default function GameOverOverlay() {
  const gameOver = useGameStore((s) => s.gameOver);
  const reset = useGameStore((s) => s.reset);
  const enterReviewMode = useGameStore((s) => s.enterReviewMode);
  const saveCurrentGame = useGameStore((s) => s.saveCurrentGame);
  const moveHistory = useGameStore((s) => s.moveHistory);

  if (!gameOver) return null;

  const iconMap: Record<string, string> = {
    checkmate: "♔",
    stalemate: "🤝",
    draw: "🤝",
    threefold: "🤝",
    insufficient: "🤝",
    fifty: "🤝",
  };

  const handleSaveAndNew = () => {
    saveCurrentGame();
    reset();
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
        <div className="flex flex-col gap-2 mt-6">
          {moveHistory.length > 0 && (
            <button
              onClick={enterReviewMode}
              className="w-full px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
            >
              📋 棋譜を振り返る
            </button>
          )}
          {moveHistory.length > 0 && (
            <button
              onClick={handleSaveAndNew}
              className="w-full px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              💾 保存して新しいゲーム
            </button>
          )}
          <button
            onClick={reset}
            className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
          >
            新しいゲーム
          </button>
        </div>
      </div>
    </div>
  );
}
