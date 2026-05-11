"use client";

import { useGameStore } from "@/store/game";

export default function OpeningDisplay() {
  const openingInfo = useGameStore((s) => s.openingInfo);

  if (!openingInfo) return null;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono bg-gray-700 text-blue-300 px-1.5 py-0.5 rounded">
          {openingInfo.eco}
        </span>
        <span className="text-sm font-semibold text-gray-100">{openingInfo.name}</span>
      </div>
      {openingInfo.description && (
        <p className="text-xs text-gray-400 mt-1">{openingInfo.description}</p>
      )}
    </div>
  );
}
