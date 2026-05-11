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
    // +M5 = White has mate in 5, -M5 = Black has mate in 5
    return m > 0 ? `+M${m}` : `-M${Math.abs(m)}`;
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
      {/* Black area - dark */}
      <div
        className="bg-gray-900 rounded-t transition-all duration-500"
        style={{ height: `${100 - whitePercent}%` }}
      />
      {/* White area - light */}
      <div
        className="bg-gray-100 rounded-b transition-all duration-500"
        style={{ height: `${whitePercent}%` }}
      />
      {/* Eval label pinned at the boundary */}
      <div
        className="absolute left-0 right-0 flex justify-center pointer-events-none"
        style={{ top: `${100 - whitePercent}%` }}
      >
        <span className="text-[9px] font-bold font-mono bg-gray-700/90 text-gray-100 px-0.5 rounded leading-tight -translate-y-1/2">
          {evalLabel}
        </span>
      </div>
    </div>
  );
}
