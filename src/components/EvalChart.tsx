"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useGameStore } from "@/store/game";

interface ChartDataPoint {
  name: string;
  eval: number;
  rawEval: number;
  isMate: boolean;
  mateIn?: number;
  moveIndex: number;
}

function clampEval(v: number, isMate: boolean, mateIn?: number): number {
  if (isMate) return (mateIn ?? 0) > 0 ? 1000 : -1000;
  return Math.max(-800, Math.min(800, v));
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartDataPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  let evalStr: string;
  let isWhiteWinning: boolean;
  if (d.isMate) {
    const m = d.mateIn ?? 0;
    evalStr = m > 0 ? `白メイト(${m}手)` : `黒メイト(${Math.abs(m)}手)`;
    isWhiteWinning = m > 0;
  } else {
    evalStr = `${d.rawEval > 0 ? "+" : ""}${(d.rawEval / 100).toFixed(2)}`;
    isWhiteWinning = d.rawEval >= 0;
  }
  return (
    <div className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs">
      <div className="text-gray-300">{d.name}</div>
      <div className={isWhiteWinning ? "text-white" : "text-gray-400"}>
        {evalStr}
      </div>
    </div>
  );
}

export default function EvalChart() {
  const evalHistory = useGameStore((s) => s.evalHistory);

  if (evalHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-500 text-sm">
        手を指すと評価グラフが表示されます
      </div>
    );
  }

  const data: ChartDataPoint[] = evalHistory.map((e, i) => ({
    name: `${Math.floor(i / 2) + 1}${i % 2 === 0 ? "." : "..."}${e.san}`,
    eval: clampEval(e.evaluation, e.isMate, e.mateIn),
    rawEval: e.evaluation,
    isMate: e.isMate,
    mateIn: e.mateIn,
    moveIndex: i,
  }));

  return (
    <div className="w-full h-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
          <XAxis dataKey="moveIndex" hide />
          <YAxis domain={[-800, 800]} tickCount={5} tick={{ fontSize: 9, fill: "#9ca3af" }} />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="eval"
            stroke="#60a5fa"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
