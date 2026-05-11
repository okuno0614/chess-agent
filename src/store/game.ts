import { create } from "zustand";
import type {
  EngineAnalysis,
  MoveRecord,
  ChatMessage,
  EvalRecord,
  GameOverState,
  OpeningInfo,
} from "@/types";

export interface PendingCoachContext {
  fen: string;
  playerMove: MoveRecord | null;
  opponentMove: MoveRecord | null;
  analysis: EngineAnalysis;
  opening: OpeningInfo | null;
}

export type GameMode = "free" | "vs-stockfish";

interface GameState {
  fen: string;
  moveHistory: MoveRecord[];
  analysis: EngineAnalysis | null;
  chatMessages: ChatMessage[];
  thinking: boolean;
  aiResponding: boolean;
  boardOrientation: "white" | "black";
  lastMove: { from: string; to: string } | null;
  evalHistory: EvalRecord[];
  pendingEvalBefore: number | null;
  analysisDepth: number;
  gameOver: GameOverState | null;
  openingInfo: OpeningInfo | null;
  showHint: boolean;
  // Opponent mode
  gameMode: GameMode;
  playerColor: "white" | "black";
  stockfishSkill: number; // 0-20
  isStockfishThinking: boolean;
  gameStarted: boolean;
  pendingCoachContext: PendingCoachContext | null;
  autoCoachMode: boolean;
}

interface GameActions {
  setFen: (fen: string) => void;
  addMove: (move: MoveRecord) => void;
  updateLastMoveQuality: (quality: MoveRecord["quality"], evalAfter: number) => void;
  setLastMove: (move: { from: string; to: string } | null) => void;
  setAnalysis: (analysis: EngineAnalysis | null) => void;
  addChatMessage: (msg: ChatMessage) => void;
  updateLastAssistantMessage: (content: string, isStreaming: boolean) => void;
  setThinking: (val: boolean) => void;
  setAiResponding: (val: boolean) => void;
  toggleBoardOrientation: () => void;
  reset: () => void;
  undoMove: (fen: string) => void;
  addEvalRecord: (record: EvalRecord) => void;
  setPendingEvalBefore: (val: number | null) => void;
  setAnalysisDepth: (depth: number) => void;
  setGameOver: (state: GameOverState | null) => void;
  setOpeningInfo: (info: OpeningInfo | null) => void;
  setShowHint: (val: boolean) => void;
  // Opponent mode
  setGameMode: (mode: GameMode) => void;
  setPlayerColor: (color: "white" | "black") => void;
  setStockfishSkill: (skill: number) => void;
  setIsStockfishThinking: (val: boolean) => void;
  startGame: (playerColor: "white" | "black", skill: number) => void;
  setPendingCoachContext: (ctx: PendingCoachContext | null) => void;
  setAutoCoachMode: (val: boolean) => void;
}

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const defaultState: GameState = {
  fen: INITIAL_FEN,
  moveHistory: [],
  analysis: null,
  chatMessages: [],
  thinking: false,
  aiResponding: false,
  boardOrientation: "white",
  lastMove: null,
  evalHistory: [],
  pendingEvalBefore: null,
  analysisDepth: 15,
  gameOver: null,
  openingInfo: null,
  showHint: false,
  gameMode: "free",
  playerColor: "white",
  stockfishSkill: 15,
  isStockfishThinking: false,
  gameStarted: false,
  pendingCoachContext: null,
  autoCoachMode: false,
};

export const useGameStore = create<GameState & GameActions>((set) => ({
  ...defaultState,

  setFen: (fen) => set({ fen }),
  addMove: (move) =>
    set((s) => ({ moveHistory: [...s.moveHistory, move] })),
  updateLastMoveQuality: (quality, evalAfter) =>
    set((s) => {
      const moves = [...s.moveHistory];
      if (moves.length > 0) {
        moves[moves.length - 1] = { ...moves[moves.length - 1], quality, evalAfter };
      }
      return { moveHistory: moves };
    }),
  setLastMove: (move) => set({ lastMove: move }),
  setAnalysis: (analysis) => set({ analysis }),
  addChatMessage: (msg) =>
    set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  updateLastAssistantMessage: (content, isStreaming) =>
    set((s) => {
      const msgs = [...s.chatMessages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === "assistant") {
        msgs[msgs.length - 1] = { ...last, content, isStreaming };
      }
      return { chatMessages: msgs };
    }),
  setThinking: (val) => set({ thinking: val }),
  setAiResponding: (val) => set({ aiResponding: val }),
  toggleBoardOrientation: () =>
    set((s) => ({
      boardOrientation: s.boardOrientation === "white" ? "black" : "white",
    })),
  reset: () => set({ ...defaultState }),
  undoMove: (fen) =>
    set((s) => ({
      fen,
      moveHistory: s.moveHistory.slice(0, -1),
      analysis: null,
      lastMove: null,
      evalHistory: s.evalHistory.slice(0, -1),
      gameOver: null,
    })),
  addEvalRecord: (record) =>
    set((s) => ({ evalHistory: [...s.evalHistory, record] })),
  setPendingEvalBefore: (val) => set({ pendingEvalBefore: val }),
  setAnalysisDepth: (depth) => set({ analysisDepth: depth }),
  setGameOver: (state) => set({ gameOver: state }),
  setOpeningInfo: (info) => set({ openingInfo: info }),
  setShowHint: (val) => set({ showHint: val }),
  setGameMode: (mode) => set({ gameMode: mode }),
  setPlayerColor: (color) => set({ playerColor: color }),
  setStockfishSkill: (skill) => set({ stockfishSkill: skill }),
  setIsStockfishThinking: (val) => set({ isStockfishThinking: val }),
  startGame: (playerColor, skill) =>
    set({
      ...defaultState,
      gameMode: "vs-stockfish",
      playerColor,
      stockfishSkill: skill,
      boardOrientation: playerColor,
      gameStarted: true,
    }),
  setPendingCoachContext: (ctx) => set({ pendingCoachContext: ctx }),
  setAutoCoachMode: (val) => set({ autoCoachMode: val }),
}));
