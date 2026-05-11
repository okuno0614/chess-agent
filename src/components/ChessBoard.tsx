"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { Chess } from "chess.js";
import { useGameStore } from "@/store/game";
import type { StockfishEngine } from "@/lib/engine";
import type { EngineAnalysis, MoveRecord } from "@/types";
import type { Arrow } from "react-chessboard";
import { detectOpening } from "@/data/openings";
import { classifyMoveQuality, QUALITY_META } from "@/lib/moveQuality";

export function ChessBoard() {
  const engineRef = useRef<StockfishEngine | null>(null);
  const chessRef = useRef(new Chess());
  const [copyFeedback, setCopyFeedback] = useState<"fen" | "pgn" | null>(null);

  const {
    fen, moveHistory, boardOrientation, lastMove,
    thinking, aiResponding, analysisDepth, pendingEvalBefore,
    showHint, analysis,
    gameMode, playerColor, stockfishSkill, isStockfishThinking, gameStarted,
    setFen, addMove, updateLastMoveQuality, setLastMove,
    setAnalysis, setThinking, addChatMessage, updateLastAssistantMessage,
    setAiResponding, undoMove, reset, addEvalRecord, setPendingEvalBefore,
    setAnalysisDepth, setGameOver, setOpeningInfo, setShowHint,
    toggleBoardOrientation, setIsStockfishThinking, setPendingCoachContext,
  } = useGameStore();

  // Initialize engine client-side only
  useEffect(() => {
    if (typeof window === "undefined") return;
    import("@/lib/engine").then(({ getEngine }) => {
      engineRef.current = getEngine();
    });
  }, []);

  /** Apply Stockfish's move and run coach commentary */
  const applyStockfishMove = useCallback(
    async (currentFen: string, currentHistory: MoveRecord[], evalBefore: number | null) => {
      const engine = engineRef.current;
      if (!engine) return;

      setIsStockfishThinking(true);
      try {
        const uciMove = await engine.getOpponentMove(currentFen, stockfishSkill);
        if (!uciMove || uciMove === "(none)") return;

        const chess = new Chess(currentFen);
        const from = uciMove.slice(0, 2);
        const to = uciMove.slice(2, 4);
        const promotion = uciMove[4] ?? undefined;
        const move = chess.move({ from, to, promotion });
        if (!move) return;

        const newFen = chess.fen();
        const newMoveRecord: MoveRecord = {
          san: move.san,
          uci: uciMove,
          fen: newFen,
          moveNumber: Math.floor(currentHistory.length / 2) + 1,
          color: move.color,
        };
        const newHistory = [...currentHistory, newMoveRecord];

        chessRef.current = chess;
        setFen(newFen);
        addMove(newMoveRecord);
        setLastMove({ from, to });
        setIsStockfishThinking(false);

        // Analyze and coach: explain Stockfish's move to the player
        setThinking(true);
        setAnalysis(null);
        let result: EngineAnalysis;
        try {
          result = await engine.analyzePosition(newFen, analysisDepth, 3);
        } catch {
          engine.reinitialize();
          result = await engine.analyzePosition(newFen, analysisDepth, 3);
        }
        setAnalysis(result);
        setThinking(false);

        // Track eval
        if (evalBefore !== null) {
          const quality = classifyMoveQuality(evalBefore, result.evaluation, move.color, result.isMate);
          updateLastMoveQuality(quality, result.evaluation);
          addEvalRecord({
            moveIndex: newHistory.length - 1,
            san: move.san,
            evaluation: result.evaluation,
            isMate: result.isMate,
            mateIn: result.mateIn,
            side: move.color,
            quality,
          });
        }
        setPendingEvalBefore(result.evaluation);

        const opening = detectOpening(newHistory.map((m) => m.san));
        setOpeningInfo(opening);

        // Game over check
        if (chess.isGameOver()) {
          if (chess.isCheckmate()) {
            const winner = chess.turn() === "w" ? "black" : "white";
            setGameOver({ reason: "checkmate", winner, message: `チェックメイト！${winner === "white" ? "白" : "黒"}の勝利` });
          } else if (chess.isStalemate()) {
            setGameOver({ reason: "stalemate", message: "ステイルメイト（引き分け）" });
          } else if (chess.isThreefoldRepetition()) {
            setGameOver({ reason: "threefold", message: "3回同一局面（引き分け）" });
          } else if (chess.isInsufficientMaterial()) {
            setGameOver({ reason: "insufficient", message: "駒不足（引き分け）" });
          } else if (chess.isDraw()) {
            setGameOver({ reason: "draw", message: "50手ルール（引き分け）" });
          }
          return;
        }

        // Merge opponent move into pending coach context (player move was set in runAnalysisAndCoach)
        const currentCtx = useGameStore.getState().pendingCoachContext;
        setPendingCoachContext({
          fen: newFen,
          playerMove: currentCtx?.playerMove ?? null,
          opponentMove: newMoveRecord,
          analysis: result,
          opening,
        });
      } catch (e) {
        console.error("Stockfish move failed:", e);
      } finally {
        setIsStockfishThinking(false);
        setThinking(false);
      }
    },
    [
      stockfishSkill, analysisDepth, playerColor,
      setFen, addMove, setLastMove, setAnalysis, setThinking,
      updateLastMoveQuality, addEvalRecord, setPendingEvalBefore,
      setOpeningInfo, setGameOver, setIsStockfishThinking, setPendingCoachContext,
    ]
  );

  // When playing as Black, Stockfish makes the first move
  useEffect(() => {
    if (
      gameStarted &&
      gameMode === "vs-stockfish" &&
      playerColor === "black" &&
      moveHistory.length === 0 &&
      !isStockfishThinking &&
      !thinking &&
      engineRef.current
    ) {
      const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      applyStockfishMove(INITIAL_FEN, [], null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameMode, playerColor]);

  const runAnalysis = useCallback(
    async (
      newFen: string,
      newHistory: MoveRecord[],
      evalBefore: number | null,
      isAutoAnalysis = true
    ) => {
      const engine = engineRef.current;
      if (!engine) return;

      setThinking(true);
      setAnalysis(null);

      try {
        let result: EngineAnalysis;
        try {
          result = await engine.analyzePosition(newFen, analysisDepth, 3);
        } catch {
          engine.reinitialize();
          result = await engine.analyzePosition(newFen, analysisDepth, 3);
        }
        setAnalysis(result);
        setThinking(false);

        // Move quality
        if (isAutoAnalysis && evalBefore !== null && newHistory.length > 0) {
          const lastMoveRecord = newHistory[newHistory.length - 1];
          const evalAfter = result.evaluation;
          const quality = classifyMoveQuality(evalBefore, evalAfter, lastMoveRecord.color, result.isMate);
          updateLastMoveQuality(quality, evalAfter);
          addEvalRecord({
            moveIndex: newHistory.length - 1,
            san: lastMoveRecord.san,
            evaluation: evalAfter,
            isMate: result.isMate,
            mateIn: result.mateIn,
            side: lastMoveRecord.color,
            quality,
          });
        }

        setPendingEvalBefore(result.evaluation);
        const opening = detectOpening(newHistory.map((m) => m.san));
        setOpeningInfo(opening);

        // Game over check
        const chess = new Chess(newFen);
        if (chess.isGameOver()) {
          if (chess.isCheckmate()) {
            const winner = chess.turn() === "w" ? "black" : "white";
            setGameOver({ reason: "checkmate", winner, message: `チェックメイト！${winner === "white" ? "白" : "黒"}の勝利` });
          } else if (chess.isStalemate()) {
            setGameOver({ reason: "stalemate", message: "ステイルメイト（引き分け）" });
          } else if (chess.isThreefoldRepetition()) {
            setGameOver({ reason: "threefold", message: "3回同一局面（引き分け）" });
          } else if (chess.isInsufficientMaterial()) {
            setGameOver({ reason: "insufficient", message: "駒不足（引き分け）" });
          } else if (chess.isDraw()) {
            setGameOver({ reason: "draw", message: "50手ルール（引き分け）" });
          }
          return;
        }

        // Set pending coach context for manual coaching button
        if (isAutoAnalysis) {
          const playerMoveRecord = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
          setPendingCoachContext({
            fen: newFen,
            playerMove: playerMoveRecord,
            opponentMove: null,
            analysis: result,
            opening,
          });
        }

        // In vs-stockfish mode: trigger Stockfish after player's move
        if (
          isAutoAnalysis &&
          gameMode === "vs-stockfish" &&
          !chess.isGameOver()
        ) {
          const isPlayerWhite = playerColor === "white";
          const playerJustMoved =
            (isPlayerWhite && newHistory.length % 2 === 1) ||
            (!isPlayerWhite && newHistory.length % 2 === 0);
          if (playerJustMoved) {
            await applyStockfishMove(newFen, newHistory, result.evaluation);
          }
        }
      } catch (e) {
        console.error("Analysis failed:", e);
        setThinking(false);
      }
    },
    [
      analysisDepth, gameMode, playerColor,
      setThinking, setAnalysis, updateLastMoveQuality, addEvalRecord,
      setPendingEvalBefore, setOpeningInfo, setGameOver, setPendingCoachContext,
      applyStockfishMove,
    ]
  );

  const onPieceDrop = useCallback(
    ({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!targetSquare) return false;
      if (thinking || aiResponding || isStockfishThinking) return false;

      // In vs-stockfish mode, block if it's not player's turn
      if (gameMode === "vs-stockfish") {
        const chess = new Chess(fen);
        const currentTurn = chess.turn(); // "w" or "b"
        const playerChessColor = playerColor === "white" ? "w" : "b";
        if (currentTurn !== playerChessColor) return false;
      }

      const chess = chessRef.current;
      try {
        if (chess.fen() !== fen) chess.load(fen);
      } catch { return false; }

      const pieceType = piece.pieceType;
      const isPromotion =
        pieceType[1]?.toLowerCase() === "p" &&
        (targetSquare[1] === "8" || targetSquare[1] === "1");

      try {
        const move = chess.move({
          from: sourceSquare, to: targetSquare,
          promotion: isPromotion ? "q" : undefined,
        });
        if (!move) return false;

        const newFen = chess.fen();
        const newMoveRecord: MoveRecord = {
          san: move.san,
          uci: `${sourceSquare}${targetSquare}${isPromotion ? "q" : ""}`,
          fen: newFen,
          moveNumber: Math.floor(moveHistory.length / 2) + 1,
          color: move.color,
        };
        const newHistory = [...moveHistory, newMoveRecord];

        setFen(newFen);
        addMove(newMoveRecord);
        setLastMove({ from: sourceSquare, to: targetSquare });
        setShowHint(false);

        runAnalysis(newFen, newHistory, pendingEvalBefore, true);
        return true;
      } catch { return false; }
    },
    [
      fen, moveHistory, thinking, aiResponding, isStockfishThinking,
      gameMode, playerColor, pendingEvalBefore,
      setFen, addMove, setLastMove, setShowHint, runAnalysis,
    ]
  );

  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0) return;
    // In vs mode: undo 2 moves (opponent + player) unless only 1 exists
    const undoCount = gameMode === "vs-stockfish" && moveHistory.length >= 2 ? 2 : 1;
    const toReplay = moveHistory.slice(0, -undoCount);
    const chess = new Chess();
    for (const m of toReplay) {
      chess.move({ from: m.uci.slice(0, 2), to: m.uci.slice(2, 4), promotion: m.uci[4] });
    }
    const newFen = chess.fen();
    chessRef.current = chess;
    // Undo twice from store if needed
    for (let i = 0; i < undoCount; i++) {
      useGameStore.getState().undoMove(chess.fen());
    }
    useGameStore.setState({ fen: newFen, lastMove: null, analysis: null, evalHistory: useGameStore.getState().evalHistory.slice(0, -undoCount) });
    setShowHint(false);
  }, [moveHistory, gameMode, setShowHint]);

  const handleReset = useCallback(() => {
    chessRef.current = new Chess();
    reset();
  }, [reset]);

  const handleCopy = useCallback(async (type: "fen" | "pgn") => {
    try {
      if (type === "fen") {
        await navigator.clipboard.writeText(fen);
      } else {
        const chess = new Chess();
        for (const m of moveHistory) {
          chess.move({ from: m.uci.slice(0, 2), to: m.uci.slice(2, 4), promotion: m.uci[4] });
        }
        await navigator.clipboard.writeText(chess.pgn());
      }
      setCopyFeedback(type);
      setTimeout(() => setCopyFeedback(null), 1500);
    } catch { console.error("Copy failed"); }
  }, [fen, moveHistory]);

  // Square highlights
  const customSquareStyles: Record<string, React.CSSProperties> = {};
  if (lastMove) {
    customSquareStyles[lastMove.from] = { backgroundColor: "rgba(255, 255, 0, 0.3)" };
    customSquareStyles[lastMove.to] = { backgroundColor: "rgba(255, 255, 0, 0.5)" };
  }

  // Hint arrow
  const arrows: Arrow[] = [];
  if (showHint && analysis?.bestMove && analysis.bestMove.length >= 4) {
    arrows.push({ startSquare: analysis.bestMove.slice(0, 2), endSquare: analysis.bestMove.slice(2, 4), color: "#3b82f6" });
  }

  const lastMoveRecord = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;
  const qualityMeta = lastMoveRecord?.quality ? QUALITY_META[lastMoveRecord.quality] : null;
  const isMyTurn = gameMode !== "vs-stockfish" || (() => {
    const chess = new Chess(fen);
    return chess.turn() === (playerColor === "white" ? "w" : "b");
  })();

  return (
    <div className="flex flex-col gap-3">
      {/* Status bar */}
      {gameMode === "vs-stockfish" && (
        <div className={`text-sm font-medium px-3 py-1.5 rounded-lg text-center ${
          isStockfishThinking
            ? "bg-orange-900/40 text-orange-300 animate-pulse"
            : isMyTurn
            ? "bg-green-900/40 text-green-300"
            : "bg-gray-700 text-gray-400"
        }`}>
          {isStockfishThinking
            ? "⚙️ Stockfish 思考中..."
            : isMyTurn
            ? `✋ あなたの番（${playerColor === "white" ? "白" : "黒"}）`
            : "⏳ 相手の番"}
        </div>
      )}

      {/* Quality badge */}
      {qualityMeta && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${qualityMeta.bgColor} border border-gray-700`}>
          <span className={`text-lg font-bold ${qualityMeta.color}`}>{qualityMeta.icon}</span>
          <span className={`text-sm font-medium ${qualityMeta.color}`}>{qualityMeta.label}</span>
        </div>
      )}

      <Chessboard
        options={{
          position: fen,
          onPieceDrop,
          boardOrientation,
          squareStyles: customSquareStyles,
          arrows,
          boardStyle: {
            borderRadius: "8px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
          },
          darkSquareStyle: { backgroundColor: "#4a7c59" },
          lightSquareStyle: { backgroundColor: "#f0d9b5" },
          allowDragging: isMyTurn && !thinking && !aiResponding && !isStockfishThinking,
        }}
      />

      {/* Controls row 1 */}
      <div className="flex gap-2">
        <button
          onClick={handleUndo}
          disabled={moveHistory.length === 0 || thinking || aiResponding || isStockfishThinking}
          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-200 text-sm font-medium py-2 rounded-lg transition-colors"
        >
          ← {gameMode === "vs-stockfish" ? "2手戻す" : "1手戻す"}
        </button>
        <button
          onClick={toggleBoardOrientation}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium py-2 rounded-lg transition-colors"
        >
          ⇅ 反転
        </button>
        <button
          onClick={handleReset}
          disabled={thinking || aiResponding || isStockfishThinking}
          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-200 text-sm font-medium py-2 rounded-lg transition-colors"
        >
          リセット
        </button>
      </div>

      {/* Controls row 2 */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowHint(!showHint)}
          disabled={!analysis?.bestMove || thinking || !isMyTurn}
          className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-40 ${
            showHint
              ? "bg-blue-700 hover:bg-blue-600 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-200"
          }`}
        >
          💡 ヒント
        </button>
        <button
          onClick={() => handleCopy("fen")}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {copyFeedback === "fen" ? "✓ コピー済" : "FENコピー"}
        </button>
        <button
          onClick={() => handleCopy("pgn")}
          disabled={moveHistory.length === 0}
          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-200 text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {copyFeedback === "pgn" ? "✓ コピー済" : "PGNコピー"}
        </button>
      </div>

      {/* Depth slider */}
      <div className="bg-gray-800 rounded-lg px-3 py-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">解析深さ</span>
          <span className="text-xs font-mono text-gray-300">{analysisDepth}</span>
        </div>
        <input
          type="range" min={8} max={20} step={1}
          value={analysisDepth}
          onChange={(e) => setAnalysisDepth(Number(e.target.value))}
          disabled={thinking || aiResponding}
          className="w-full accent-blue-500 disabled:opacity-40"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-0.5">
          <span>速い (8)</span>
          <span>深い (20)</span>
        </div>
      </div>
    </div>
  );
}
