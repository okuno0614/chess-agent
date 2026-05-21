"use client";

import { useGameStore } from "@/store/game";
import { QUALITY_META } from "@/lib/moveQuality";

export function MoveHistory() {
  const moveHistory = useGameStore((s) => s.moveHistory);
  const isReviewMode = useGameStore((s) => s.isReviewMode);
  const reviewSnapshot = useGameStore((s) => s.reviewSnapshot);
  const reviewMoveIndex = useGameStore((s) => s.reviewMoveIndex);
  const setReviewMoveIndex = useGameStore((s) => s.setReviewMoveIndex);
  const exitAnalysisMode = useGameStore((s) => s.exitAnalysisMode);

  const displayMoves = isReviewMode && reviewSnapshot ? reviewSnapshot.moves : moveHistory;

  if (!displayMoves.length) {
    return (
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
          棋譜
        </h3>
        <div className="text-sm text-gray-600">まだ手が指されていません</div>
      </div>
    );
  }

  const pairs: { n: number; white: typeof displayMoves[0]; black?: typeof displayMoves[0]; wIdx: number; bIdx?: number }[] = [];
  for (let i = 0; i < displayMoves.length; i += 2) {
    pairs.push({
      n: Math.floor(i / 2) + 1,
      white: displayMoves[i],
      black: displayMoves[i + 1],
      wIdx: i + 1,
      bIdx: i + 2 <= displayMoves.length ? i + 2 : undefined,
    });
  }

  const handleMoveClick = (idx: number) => {
    exitAnalysisMode();
    setReviewMoveIndex(idx);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
        棋譜
      </h3>
      <div className="max-h-32 overflow-y-auto">
        <table className="w-full text-sm font-mono">
          <tbody>
            {pairs.map((pair) => (
              <tr key={pair.n} className="hover:bg-gray-700/50">
                <td className="text-gray-500 pr-2 w-6">{pair.n}.</td>
                <td className="pr-3">
                  <MoveCell
                    move={pair.white}
                    active={isReviewMode && reviewMoveIndex === pair.wIdx}
                    onClick={isReviewMode ? () => handleMoveClick(pair.wIdx) : undefined}
                  />
                </td>
                <td>
                  {pair.black && (
                    <MoveCell
                      move={pair.black}
                      active={isReviewMode && reviewMoveIndex === pair.bIdx}
                      onClick={isReviewMode && pair.bIdx !== undefined ? () => handleMoveClick(pair.bIdx!) : undefined}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isReviewMode && (
        <div
          className={`mt-1 text-xs px-1 py-0.5 rounded cursor-pointer inline-block ${
            reviewMoveIndex === 0 ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-300"
          }`}
          onClick={() => handleMoveClick(0)}
        >
          開始局面
        </div>
      )}
    </div>
  );
}

function MoveCell({
  move,
  active,
  onClick,
}: {
  move: { san: string; quality?: string };
  active?: boolean;
  onClick?: () => void;
}) {
  const meta = move.quality ? QUALITY_META[move.quality as keyof typeof QUALITY_META] : null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-0.5 ${
        onClick ? "cursor-pointer" : ""
      } ${active ? "bg-blue-600 text-white" : onClick ? "hover:bg-gray-600" : ""}`}
      onClick={onClick}
    >
      <span className={active ? "text-white" : "text-gray-300"}>{move.san}</span>
      {meta && (
        <span className={`text-xs ${active ? "text-white" : meta.color}`} title={meta.label}>
          {meta.icon}
        </span>
      )}
    </span>
  );
}
