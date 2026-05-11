"use client";

import { Chess } from "chess.js";
import { useGameStore } from "@/store/game";

function pvToSan(fen: string, ucis: string[]): string[] {
  try {
    const chess = new Chess(fen);
    const sans: string[] = [];
    for (const uci of ucis.slice(0, 4)) {
      const move = chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4],
      });
      if (!move) break;
      sans.push(move.san);
    }
    return sans;
  } catch {
    return ucis.slice(0, 4);
  }
}

function evalLabel(cp: number, isMate: boolean, mateIn?: number): string {
  if (isMate) return mateIn !== undefined ? `M${Math.abs(mateIn)}` : "M";
  const v = (cp / 100).toFixed(2);
  return cp >= 0 ? `+${v}` : v;
}

export function CandidateLines() {
  const analysis = useGameStore((s) => s.analysis);
  const fen = useGameStore((s) => s.fen);
  const thinking = useGameStore((s) => s.thinking);

  if (thinking) {
    return (
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
          候補手
        </h3>
        <div className="text-sm text-gray-500 animate-pulse">解析中...</div>
      </div>
    );
  }

  if (!analysis || !analysis.multiPv.length) {
    return (
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
          候補手
        </h3>
        <div className="text-sm text-gray-600">手が指されるまで待機中</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
        候補手{" "}
        <span className="text-gray-600 normal-case font-normal">
          depth {analysis.depth}
        </span>
      </h3>
      <div className="space-y-1.5">
        {analysis.multiPv.slice(0, 3).map((pv) => {
          const sans = pvToSan(fen, pv.moves);
          const label = evalLabel(pv.evaluation, pv.isMate, pv.mateIn);
          const isPositive = pv.isMate ? (pv.mateIn ?? 0) > 0 : pv.evaluation >= 0;

          return (
            <div key={pv.rank} className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-3 shrink-0">{pv.rank}.</span>
              <span
                className={`font-mono text-xs font-semibold w-12 shrink-0 ${
                  isPositive ? "text-blue-400" : "text-orange-400"
                }`}
              >
                {label}
              </span>
              <span className="text-gray-300 font-mono text-xs truncate">
                {sans.join(" ")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
