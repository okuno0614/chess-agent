"use client";

import { useGameStore } from "@/store/game";
import { QUALITY_META } from "@/lib/moveQuality";

export function MoveHistory() {
  const moveHistory = useGameStore((s) => s.moveHistory);

  if (!moveHistory.length) {
    return (
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
          棋譜
        </h3>
        <div className="text-sm text-gray-600">まだ手が指されていません</div>
      </div>
    );
  }

  const pairs: { n: number; white: typeof moveHistory[0]; black?: typeof moveHistory[0] }[] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairs.push({
      n: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1],
    });
  }

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
                  <MoveCell move={pair.white} />
                </td>
                <td>
                  {pair.black && <MoveCell move={pair.black} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MoveCell({ move }: { move: { san: string; quality?: string } }) {
  const meta = move.quality ? QUALITY_META[move.quality as keyof typeof QUALITY_META] : null;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-gray-300">{move.san}</span>
      {meta && (
        <span className={`text-xs ${meta.color}`} title={meta.label}>
          {meta.icon}
        </span>
      )}
    </span>
  );
}
