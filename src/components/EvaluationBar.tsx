"use client";

import { useGameStore } from "@/store/game";

function evalToPercent(
  cp: number,
  isMate: boolean,
  mateIn?: number
): number {
  if (isMate) {
    if (mateIn === undefined) return 50;
    return mateIn > 0 ? 100 : 0;
  }
  return Math.round(100 / (1 + Math.exp(-cp / 400)));
}

function formatEval(cp: number, isMate: boolean, mateIn?: number): string {
  if (isMate) {
    const m = mateIn ?? 0;
    return m > 0 ? `M${m}` : `M${Math.abs(m)}`;
  }
  const v = (cp / 100).toFixed(1);
  return cp >= 0 ? `+${v}` : v;
}

export function EvaluationBar() {
  const analysis = useGameStore((s) => s.analysis);
  const thinking = useGameStore((s) => s.thinking);

  if (!analysis) {
    return (
      <div className="w-6 bg-gray-700 rounded flex flex-col items-center justify-center h-full">
        <div className="text-xs text-gray-500 rotate-90 whitespace-nowrap">
          {thinking ? "解析中..." : "待機中"}
        </div>
      </div>
    );
  }

  const whitePercent = evalToPercent(
    analysis.evaluation,
    analysis.isMate,
    analysis.mateIn
  );
  const evalLabel = formatEval(
    analysis.evaluation,
    analysis.isMate,
    analysis.mateIn
  );

  return (
    <div className="w-6 flex flex-col h-full relative">
      {/* Black area */}
      <div
        className="bg-gray-200 rounded-t transition-all duration-500"
        style={{ height: `${100 - whitePercent}%` }}
      />
      {/* White area */}
      <div
        className="bg-gray-800 rounded-b transition-all duration-500"
        style={{ height: `${whitePercent}%` }}
      />
      {/* Eval label */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center">
        <span className="text-[10px] font-bold text-gray-400 bg-gray-900/80 px-0.5 rounded">
          {evalLabel}
        </span>
      </div>
    </div>
  );
}
