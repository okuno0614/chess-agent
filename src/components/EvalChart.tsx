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

function clampEval(v: number, isMate: boolean, mateIn?: number): number {
  if (isMate) return (mateIn ?? 0) > 0 ? 1000 : -1000;
  return Math.max(-800, Math.min(800, v));
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

  const data = evalHistory.map((e, i) => ({
    name: `${Math.floor(i / 2) + 1}${i % 2 === 0 ? "." : "..."}${e.san}`,
    eval: clampEval(e.evaluation, e.isMate, e.mateIn),
    rawEval: e.evaluation,
    isMate: e.isMate,
    mateIn: e.mateIn,
    moveIndex: i,
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { payload: (typeof data)[0] }[];
  }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const evalStr = d.isMate
      ? `メイト${d.mateIn}`
      : `${d.rawEval > 0 ? "+" : ""}${(d.rawEval / 100).toFixed(2)}`;
    return (
      <div className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs">
        <div className="text-gray-300">{d.name}</div>
        <div className={d.rawEval >= 0 ? "text-white" : "text-gray-400"}>
          {evalStr}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
          <XAxis dataKey="moveIndex" hide />
          <YAxis domain={[-800, 800]} tickCount={5} tick={{ fontSize: 9, fill: "#9ca3af" }} />
          <Tooltip content={<CustomTooltip />} />
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
