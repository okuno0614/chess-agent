"use client";

import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { useGameStore } from "@/store/game";

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function ReviewControls() {
  const isReviewMode = useGameStore((s) => s.isReviewMode);
  const isAnalysisMode = useGameStore((s) => s.isAnalysisMode);
  const reviewMoveIndex = useGameStore((s) => s.reviewMoveIndex);
  const reviewSnapshot = useGameStore((s) => s.reviewSnapshot);
  const savedGames = useGameStore((s) => s.savedGames);

  const setReviewMoveIndex = useGameStore((s) => s.setReviewMoveIndex);
  const enterAnalysisMode = useGameStore((s) => s.enterAnalysisMode);
  const exitAnalysisMode = useGameStore((s) => s.exitAnalysisMode);
  const exitReviewMode = useGameStore((s) => s.exitReviewMode);
  const saveCurrentGame = useGameStore((s) => s.saveCurrentGame);
  const loadSavedGamesAction = useGameStore((s) => s.loadSavedGamesAction);
  const deleteSavedGame = useGameStore((s) => s.deleteSavedGame);
  const loadGameForReview = useGameStore((s) => s.loadGameForReview);
  const resumeFromPosition = useGameStore((s) => s.resumeFromPosition);
  const reset = useGameStore((s) => s.reset);

  const [showSaved, setShowSaved] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const totalMoves = reviewSnapshot?.moves.length ?? 0;

  // Load saved games when panel is first shown
  const loadedRef = useRef(false);
  useEffect(() => {
    if (!loadedRef.current) {
      loadSavedGamesAction();
      loadedRef.current = true;
    }
  }, [loadSavedGamesAction]);

  if (!isReviewMode) return null;

  const currentFen =
    reviewMoveIndex === 0
      ? INITIAL_FEN
      : reviewSnapshot?.moves[reviewMoveIndex - 1]?.fen ?? INITIAL_FEN;

  const currentSan =
    reviewMoveIndex > 0
      ? reviewSnapshot?.moves[reviewMoveIndex - 1]?.san
      : null;

  const handleResumeAs = (color: "white" | "black") => {
    if (!reviewSnapshot) return;
    const priorMoves = reviewSnapshot.moves.slice(0, reviewMoveIndex);
    const priorEvals = reviewSnapshot.evalHistory.slice(0, reviewMoveIndex);
    const chess = new Chess(currentFen);
    const turnColor = chess.turn() === "w" ? "white" : "black";
    const needsStockfishFirst = turnColor !== color;
    resumeFromPosition(
      currentFen,
      priorMoves,
      priorEvals,
      color,
      reviewSnapshot.stockfishSkill,
      needsStockfishFirst
    );
  };

  const handleSave = () => {
    saveCurrentGame();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleExitToNew = () => {
    exitReviewMode();
    reset();
  };

  return (
    <div className="bg-gray-800 border border-emerald-800 rounded-lg p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-400 uppercase">
            {isAnalysisMode ? "🔬 フリー探索中" : "📋 振り返りモード"}
          </span>
          <span className="text-xs text-gray-500">
            {reviewMoveIndex}/{totalMoves}手
            {currentSan && ` — ${currentSan}`}
          </span>
        </div>
        <button
          onClick={exitReviewMode}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-1"
          title="振り返りを終了"
        >
          ✕ 終了
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-1">
        <button
          onClick={() => { exitAnalysisMode(); setReviewMoveIndex(0); }}
          disabled={reviewMoveIndex === 0}
          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-gray-200 text-xs py-1.5 rounded transition-colors"
          title="最初へ"
        >◀◀</button>
        <button
          onClick={() => { exitAnalysisMode(); setReviewMoveIndex(reviewMoveIndex - 1); }}
          disabled={reviewMoveIndex === 0}
          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-gray-200 text-xs py-1.5 rounded transition-colors"
          title="前の手"
        >◀</button>
        <button
          onClick={() => { exitAnalysisMode(); setReviewMoveIndex(reviewMoveIndex + 1); }}
          disabled={reviewMoveIndex >= totalMoves}
          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-gray-200 text-xs py-1.5 rounded transition-colors"
          title="次の手"
        >▶</button>
        <button
          onClick={() => { exitAnalysisMode(); setReviewMoveIndex(totalMoves); }}
          disabled={reviewMoveIndex >= totalMoves}
          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-gray-200 text-xs py-1.5 rounded transition-colors"
          title="最後へ"
        >▶▶</button>
      </div>

      {/* Mode toggle */}
      <button
        onClick={isAnalysisMode ? exitAnalysisMode : enterAnalysisMode}
        className={`w-full text-xs py-1.5 rounded font-medium transition-colors ${
          isAnalysisMode
            ? "bg-purple-700 hover:bg-purple-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-gray-200"
        }`}
      >
        {isAnalysisMode ? "🔙 ナビモードに戻る" : "🔬 フリー探索（白黒両方動かす）"}
      </button>

      {/* Resume as color */}
      {!isAnalysisMode && (
        <div>
          <p className="text-xs text-gray-500 mb-1">この局面からStockfishと対戦:</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleResumeAs("white")}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs py-1.5 rounded transition-colors"
            >
              ⬜ 白として対戦
            </button>
            <button
              onClick={() => handleResumeAs("black")}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs py-1.5 rounded transition-colors"
            >
              ⬛ 黒として対戦
            </button>
          </div>
        </div>
      )}

      {/* Save / archive */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors ${
            savedFeedback
              ? "bg-emerald-700 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-200"
          }`}
        >
          {savedFeedback ? "✓ 保存済み" : "💾 棋譜を保存"}
        </button>
        <button
          onClick={() => setShowSaved((v) => !v)}
          className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors ${
            showSaved ? "bg-gray-600 text-white" : "bg-gray-700 hover:bg-gray-600 text-gray-200"
          }`}
        >
          {showSaved ? "▲ 保存一覧を閉じる" : `📂 保存一覧 (${savedGames.length})`}
        </button>
      </div>

      {/* Saved games list */}
      {showSaved && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {savedGames.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-2">保存された棋譜はありません</p>
          )}
          {savedGames.map((g) => (
            <div key={g.id} className="flex items-center gap-1 bg-gray-700/60 rounded px-2 py-1">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-300 truncate">
                  {g.gameMode === "vs-stockfish" ? `Lv.${g.stockfishSkill} vs AI` : "フリー"}
                  {g.result?.winner ? ` — ${g.result.winner === "white" ? "白勝" : "黒勝"}` : g.result ? " — 引分" : ""}
                </div>
                <div className="text-xs text-gray-600">{formatDate(g.date)} · {g.moves.length}手</div>
              </div>
              <button
                onClick={() => loadGameForReview(g)}
                className="text-xs bg-emerald-800 hover:bg-emerald-700 text-emerald-300 px-2 py-0.5 rounded shrink-0"
              >
                開く
              </button>
              <button
                onClick={() => deleteSavedGame(g.id)}
                className="text-xs text-gray-600 hover:text-red-400 px-1 shrink-0"
                title="削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Exit to new game */}
      <button
        onClick={handleExitToNew}
        className="w-full text-xs py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-medium transition-colors"
      >
        新しいゲームへ
      </button>
    </div>
  );
}
