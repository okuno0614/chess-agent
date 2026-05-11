import type { MoveQuality } from "@/types";

export function classifyMoveQuality(
  evalBefore: number,
  evalAfter: number,
  side: "w" | "b",
): MoveQuality {
  // Engine normalizes mate to ±(10000 - mateIn), so centipawn loss works for all cases.
  // Loss from the moving side's perspective (negative = improved their position).
  // For white: evalBefore - evalAfter (positive = white lost material)
  // For black: evalAfter - evalBefore (positive = black's position worsened)
  const loss =
    side === "w" ? evalBefore - evalAfter : evalAfter - evalBefore;

  // Brilliant: the moving side created a forced checkmate (evalAfter near ±10000)
  // from a position that was not already clearly winning (< 3 pawns advantage).
  const moveSideEvalAfter = side === "w" ? evalAfter : -evalAfter;
  const moveSideEvalBefore = side === "w" ? evalBefore : -evalBefore;
  if (moveSideEvalAfter >= 9000 && moveSideEvalBefore < 300) return "brilliant";

  if (loss <= 5) return "best";
  if (loss <= 20) return "good";
  if (loss <= 50) return "inaccuracy";
  if (loss <= 100) return "mistake";
  return "blunder";
}

export const QUALITY_META: Record<
  MoveQuality,
  { icon: string; label: string; color: string; bgColor: string }
> = {
  brilliant: { icon: "!!", label: "ブリリアント", color: "text-teal-400", bgColor: "bg-teal-900/50" },
  best:      { icon: "!",  label: "ベスト",       color: "text-blue-400", bgColor: "bg-blue-900/50" },
  good:      { icon: "✓",  label: "良い手",       color: "text-green-400", bgColor: "bg-green-900/50" },
  inaccuracy:{ icon: "?!", label: "緩手",         color: "text-yellow-400", bgColor: "bg-yellow-900/50" },
  mistake:   { icon: "?",  label: "疑問手",       color: "text-orange-400", bgColor: "bg-orange-900/50" },
  blunder:   { icon: "??", label: "悪手",         color: "text-red-400", bgColor: "bg-red-900/50" },
};
