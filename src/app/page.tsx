"use client";

import { useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { EvaluationBar } from "@/components/EvaluationBar";
import { CandidateLines } from "@/components/CandidateLines";
import { MoveHistory } from "@/components/MoveHistory";
import { ChatPanel } from "@/components/ChatPanel";
import OpeningDisplay from "@/components/OpeningDisplay";
import EvalChart from "@/components/EvalChart";
import GameOverOverlay from "@/components/GameOverOverlay";
import GameSetup from "@/components/GameSetup";
import ReviewControls from "@/components/ReviewControls";
import { useGameStore } from "@/store/game";

const ChessBoard = dynamic(
  () => import("@/components/ChessBoard").then((m) => m.ChessBoard),
  { ssr: false, loading: () => <div className="aspect-square bg-gray-700 rounded-lg animate-pulse" /> }
);

async function callCoachAPI(params: {
  fen: string;
  moveHistory: import("@/types").MoveRecord[];
  engineAnalysis: import("@/types").EngineAnalysis;
  message: string;
  isAutoAnalysis: boolean;
  opening?: import("@/types").OpeningInfo | null;
  isOpponentMove?: boolean;
  playerColor?: "white" | "black";
  playerMove?: import("@/types").MoveRecord | null;
  opponentMove?: import("@/types").MoveRecord | null;
  batchMode?: boolean;
  addChatMessage: (msg: { id: string; role: "user" | "assistant"; content: string; isStreaming?: boolean }) => void;
  updateLastAssistantMessage: (content: string, isStreaming: boolean) => void;
  setAiResponding: (val: boolean) => void;
}) {
  const {
    fen, moveHistory, engineAnalysis, message, isAutoAnalysis,
    opening, isOpponentMove, playerColor, playerMove, opponentMove, batchMode,
    addChatMessage, updateLastAssistantMessage, setAiResponding,
  } = params;

  addChatMessage({ id: crypto.randomUUID(), role: "assistant", content: "", isStreaming: true });
  setAiResponding(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fen, moveHistory, engineAnalysis, message, isAutoAnalysis,
        opening, isOpponentMove, playerColor, playerMove, opponentMove, batchMode,
      }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (reader) {
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        updateLastAssistantMessage(accumulated, true);
      }
      updateLastAssistantMessage(accumulated, false);
    }
  } catch (e) {
    console.error("Coach API error:", e);
    updateLastAssistantMessage("申し訳ありません。エラーが発生しました。もう一度試してください。", false);
  } finally {
    setAiResponding(false);
  }
}

export default function Home() {
  const thinking = useGameStore((s) => s.thinking);
  const aiResponding = useGameStore((s) => s.aiResponding);
  const gameMode = useGameStore((s) => s.gameMode);
  const stockfishSkill = useGameStore((s) => s.stockfishSkill);
  const playerColor = useGameStore((s) => s.playerColor);
  const pendingCoachContext = useGameStore((s) => s.pendingCoachContext);
  const autoCoachMode = useGameStore((s) => s.autoCoachMode);

  const handleUserMessage = useCallback((msg: string) => {
    const store = useGameStore.getState();
    const { fen, moveHistory, analysis, openingInfo, playerColor: pc } = store;
    if (!analysis) return;

    store.addChatMessage({ id: crypto.randomUUID(), role: "user", content: msg, isStreaming: false });
    callCoachAPI({
      fen,
      moveHistory,
      engineAnalysis: analysis,
      message: msg,
      isAutoAnalysis: false,
      opening: openingInfo,
      playerColor: pc,
      addChatMessage: store.addChatMessage,
      updateLastAssistantMessage: store.updateLastAssistantMessage,
      setAiResponding: store.setAiResponding,
    });
  }, []);

  const handleCoachRequest = useCallback(() => {
    const store = useGameStore.getState();
    const { fen, moveHistory, analysis, openingInfo, playerColor: pc, pendingCoachContext, setPendingCoachContext } = store;
    if (!analysis || store.aiResponding) return;

    if (pendingCoachContext) {
      // Batch mode: explain player's move + opponent's response together
      callCoachAPI({
        fen: pendingCoachContext.fen,
        moveHistory,
        engineAnalysis: pendingCoachContext.analysis,
        message: "",
        isAutoAnalysis: true,
        opening: pendingCoachContext.opening,
        playerColor: pc,
        playerMove: pendingCoachContext.playerMove,
        opponentMove: pendingCoachContext.opponentMove,
        batchMode: true,
        addChatMessage: store.addChatMessage,
        updateLastAssistantMessage: store.updateLastAssistantMessage,
        setAiResponding: store.setAiResponding,
      });
      setPendingCoachContext(null);
    } else {
      // Free analysis: explain current position
      callCoachAPI({
        fen,
        moveHistory,
        engineAnalysis: analysis,
        message: "",
        isAutoAnalysis: true,
        opening: openingInfo,
        playerColor: pc,
        addChatMessage: store.addChatMessage,
        updateLastAssistantMessage: store.updateLastAssistantMessage,
        setAiResponding: store.setAiResponding,
      });
    }
  }, []);

  // Auto-coach: fire automatically when a full round is ready (both moves set) and auto mode is ON
  useEffect(() => {
    if (!autoCoachMode) return;
    if (!pendingCoachContext?.opponentMove) return;
    const store = useGameStore.getState();
    if (store.aiResponding) return;
    handleCoachRequest();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCoachContext, autoCoachMode]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">♟</span>
          <h1 className="text-lg font-bold text-gray-100">Chess Coach AI</h1>
          <span className="text-xs text-gray-500 ml-2">Stockfish + GPT-4.1 mini</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {thinking && (
            <span className="text-yellow-400 animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
              解析中
            </span>
          )}
          {aiResponding && !thinking && (
            <span className="text-blue-400 animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
              AI応答中
            </span>
          )}
        </div>
      </header>

      <main className="flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto">
        {/* Left column: board + controls */}
        <div className="flex flex-col gap-3 lg:w-[560px] shrink-0">
          <OpeningDisplay />
          <ReviewControls />
          <div className="flex gap-2">
            <div className="w-6 shrink-0" style={{ height: "560px" }}>
              <EvaluationBar />
            </div>
            <div className="flex-1">
              <ChessBoard />
            </div>
          </div>
          {/* Eval chart */}
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">評価グラフ</h3>
            <EvalChart />
          </div>
          <MoveHistory />
        </div>

        {/* Right column: setup + analysis + chat */}
        <div className="flex flex-col gap-3 flex-1 lg:h-[calc(100vh-80px)] lg:overflow-hidden">
          <GameSetup />
          {gameMode === "vs-stockfish" && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-400">
              <span>対戦中:</span>
              <span className="font-medium text-gray-200">{playerColor === "white" ? "♔ 白番" : "♚ 黒番"}</span>
              <span className="mx-1">vs</span>
              <span className="font-medium text-gray-200">Stockfish Lv.{stockfishSkill}</span>
            </div>
          )}
          <CandidateLines />
          <div className="flex-1 min-h-0">
            <ChatPanel onUserMessage={handleUserMessage} onCoachRequest={handleCoachRequest} />
          </div>
        </div>
      </main>

      <GameOverOverlay />
    </div>
  );
}
