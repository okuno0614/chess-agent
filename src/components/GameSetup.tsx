"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/game";

const SKILL_LABELS: Record<number, string> = {
  0: "入門 (Lv.0)",
  3: "初心者 (Lv.3)",
  5: "初級者 (Lv.5)",
  8: "中級者 (Lv.8)",
  10: "中上級 (Lv.10)",
  12: "上級者 (Lv.12)",
  15: "強豪 (Lv.15)",
  17: "熟練者 (Lv.17)",
  20: "エンジン最強 (Lv.20)",
};

function getSkillLabel(skill: number): string {
  const keys = Object.keys(SKILL_LABELS).map(Number).sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (skill >= keys[i]) return SKILL_LABELS[keys[i]];
  }
  return `Lv.${skill}`;
}

function getSkillColor(skill: number): string {
  if (skill <= 4) return "text-green-400";
  if (skill <= 9) return "text-blue-400";
  if (skill <= 14) return "text-yellow-400";
  if (skill <= 18) return "text-orange-400";
  return "text-red-400";
}

export default function GameSetup({ onClose }: { onClose?: () => void }) {
  const { stockfishSkill, playerColor, startGame, gameMode, setGameMode, reset } = useGameStore();
  const [selectedColor, setSelectedColor] = useState<"white" | "black">(playerColor);
  const [selectedSkill, setSelectedSkill] = useState(stockfishSkill);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (gameMode === "vs-stockfish") {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [gameMode]);

  const handleStart = () => {
    startGame(selectedColor, selectedSkill);
    onClose?.();
  };

  const handleFreeMode = () => {
    setGameMode("free");
    reset();
    onClose?.();
  };

  if (isCollapsed) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-gray-100">対戦設定</h2>
            <span className="text-xs text-gray-400">
              {selectedColor === "white" ? "♔ 白番" : "♚ 黒番"} vs Stockfish {getSkillLabel(selectedSkill)}
            </span>
          </div>
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-700"
          >
            変更 ▾
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-100">対戦設定</h2>
        <div className="flex items-center gap-2">
          {gameMode === "vs-stockfish" && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              たたむ ▲
            </button>
          )}
          {gameMode === "vs-stockfish" && (
            <button
              onClick={handleFreeMode}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              自由モードに戻る
            </button>
          )}
        </div>
      </div>

      {/* Color selector */}
      <div>
        <p className="text-xs text-gray-400 mb-2">あなたの色</p>
        <div className="flex gap-2">
          {(["white", "black"] as const).map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border transition-all ${
                selectedColor === color
                  ? "border-blue-500 bg-blue-900/30 text-white"
                  : "border-gray-600 bg-gray-700 text-gray-400 hover:border-gray-400"
              }`}
            >
              <span className="text-2xl">{color === "white" ? "♔" : "♚"}</span>
              <span className="text-sm font-medium">{color === "white" ? "白番" : "黒番"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Strength slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-400">Stockfishの強さ</p>
          <span className={`text-sm font-semibold ${getSkillColor(selectedSkill)}`}>
            {getSkillLabel(selectedSkill)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={20}
          step={1}
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>弱い (0)</span>
          <span>推奨 (15)</span>
          <span>最強 (20)</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {selectedSkill <= 5
            ? "入門〜初級者向け。チェスを始めたばかりの方に最適です。"
            : selectedSkill <= 10
            ? "中級者向け。しっかりとした戦略を学べます。"
            : selectedSkill <= 15
            ? "上級者向け。本格的なトレーニングになります。"
            : "エキスパート向け。非常に強力な相手です。"}
        </p>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
      >
        ゲーム開始 {selectedColor === "white" ? "（白番）" : "（黒番）"}
      </button>
    </div>
  );
}
