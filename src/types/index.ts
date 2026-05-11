export interface PvLine {
  rank: number;
  evaluation: number;
  isMate: boolean;
  mateIn?: number;
  moves: string[]; // UCI format
}

export interface EngineAnalysis {
  evaluation: number; // centipawns (positive = white advantage)
  isMate: boolean;
  mateIn?: number;
  bestMove: string; // UCI format e.g. "e2e4"
  multiPv: PvLine[];
  depth: number;
}

export interface MoveRecord {
  san: string;
  uci: string;
  fen: string;
  moveNumber: number;
  color: "w" | "b";
  quality?: MoveQuality;
  evalBefore?: number;
  evalAfter?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export type MoveQuality =
  | "brilliant"
  | "best"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder";

export interface EvalRecord {
  moveIndex: number;
  san: string;
  evaluation: number;
  isMate: boolean;
  mateIn?: number;
  side: "w" | "b";
  quality?: MoveQuality;
}

export interface GameOverState {
  reason: "checkmate" | "stalemate" | "draw" | "threefold" | "insufficient" | "fifty";
  winner?: "white" | "black";
  message: string;
}

export interface OpeningInfo {
  eco: string;
  name: string;
  description?: string;
}
