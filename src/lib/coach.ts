import type { EngineAnalysis, MoveRecord, OpeningInfo } from "@/types";

function formatEvaluation(analysis: EngineAnalysis): string {
  if (analysis.isMate) {
    const m = analysis.mateIn ?? 0;
    return m > 0 ? `白が${m}手でメイト` : `黒が${Math.abs(m)}手でメイト`;
  }
  const cp = analysis.evaluation;
  const pawns = (cp / 100).toFixed(2);
  if (cp > 0) return `白が+${pawns}ポーン分優勢`;
  if (cp < 0) return `黒が+${Math.abs(Number(pawns))}ポーン分優勢`;
  return "互角";
}

function formatMultiPv(analysis: EngineAnalysis): string {
  if (!analysis.multiPv.length) return "";
  const lines = analysis.multiPv
    .slice(0, 3)
    .map((pv) => {
      const evalStr = pv.isMate
        ? `メイト${pv.mateIn}`
        : `${(pv.evaluation / 100).toFixed(2)}`;
      const moves = pv.moves.slice(0, 3).join(" ");
      return `  候補手${pv.rank}: ${moves} (評価値: ${evalStr})`;
    })
    .join("\n");
  return lines;
}

/** Compress move history: only san, color, quality — last 10 moves */
function compressHistory(moveHistory: MoveRecord[]): string {
  if (moveHistory.length === 0) return "（まだ手が指されていません）";
  const recent = moveHistory.slice(-10);
  const startIndex = moveHistory.length - recent.length;
  return recent.map((m, i) => {
    const globalIndex = startIndex + i;
    const n = Math.floor(globalIndex / 2) + 1;
    const qualityTag = m.quality ? `[${m.quality}]` : "";
    return globalIndex % 2 === 0 ? `${n}.${m.san}${qualityTag}` : `${m.san}${qualityTag}`;
  }).join(" ");
}

const SYSTEM_PROMPT = `あなたはチェスの専門コーチです。

ルール:
- 初中級者向けにわかりやすく日本語で説明する
- Stockfishのエンジン解析を事実として尊重し、それに基づいて解説する
- 合法手を捏造しない
- 戦略的なアイデアと戦術的なリスクを具体的に説明する
- 学習を促す会話的なトーンで話す
- 必ず日本語で回答する
- バッチ解説（2手）の場合は白の手と黒の手をそれぞれ【】見出しで区切り、改行して分かりやすく書く
- 単独解説は200〜350文字、バッチ解説は各項目100〜200文字（合計200〜400文字）以内にまとめる`;

export function buildCoachPrompt(params: {
  fen: string;
  moveHistory: MoveRecord[];
  analysis: EngineAnalysis;
  userMessage: string;
  isAutoAnalysis: boolean;
  opening?: OpeningInfo | null;
  isOpponentMove?: boolean;
  playerColor?: "white" | "black";
  playerMove?: MoveRecord | null;
  opponentMove?: MoveRecord | null;
  batchMode?: boolean;
}): { system: string; userContent: string } {
  const {
    fen,
    moveHistory,
    analysis,
    userMessage,
    isAutoAnalysis,
    opening,
    isOpponentMove,
    playerColor,
    playerMove,
    opponentMove,
    batchMode,
  } = params;

  const lastMove =
    moveHistory.length > 0
      ? moveHistory[moveHistory.length - 1]
      : null;

  const moveNum = Math.floor((moveHistory.length - 1) / 2) + 1;
  const side = lastMove?.color === "w" ? "白" : "黒";
  const lastMoveSan = lastMove ? `${side}の${moveNum}手目: ${lastMove.san}` : "ゲーム開始";

  const evalText = formatEvaluation(analysis);
  const pvText = formatMultiPv(analysis);
  const historyText = compressHistory(moveHistory);

  const openingText = opening
    ? `\n【オープニング】\n${opening.eco} ${opening.name}${opening.description ? `\n戦略的アイデア: ${opening.description}` : ""}`
    : "";

  const context = `【局面情報】
FEN: ${fen}
棋譜（直近10手）: ${historyText}${openingText}

【エンジン解析 (depth ${analysis.depth})】
評価: ${evalText}
最善手: ${analysis.bestMove}
${pvText}`;

  let userContent: string;

  if (batchMode && playerMove && opponentMove) {
    // Batch: explain both player's move and opponent's response in one call
    const playerSideStr = playerColor === "white" ? "白" : "黒";
    const opponentSideStr = playerColor === "white" ? "黒" : "白";
    const pNum = playerMove.moveNumber;
    userContent = `${context}

あなたは${playerSideStr}番のプレイヤーのコーチです。直前の1ラウンドを以下の形式で解説してください。

【あなた（${playerSideStr}）の手: ${playerMove.san}（${pNum}手目）】
この手の良い点・改善点を教えてください。

【相手（Stockfish・${opponentSideStr}）の応手: ${opponentMove.san}】
この手の意図・脅威と、次にどう対応すべきかアドバイスをください。`;
  } else if (isOpponentMove) {
    const playerSideStr = playerColor === "white" ? "白" : "黒";
    const opponentSideStr = playerColor === "white" ? "黒" : "白";
    userContent = `${context}

あなたは${playerSideStr}番のプレイヤーのコーチです。
相手（Stockfish・${opponentSideStr}）が「${lastMove?.san ?? ""}」と指しました。
この手の意図・狙い・脅威を${playerSideStr}番プレイヤーの視点から解説してください。また、次にどう対応すべきかアドバイスをください。`;
  } else if (isAutoAnalysis) {
    userContent = `${context}

直前の手（${lastMoveSan}）についてコーチングをお願いします。この手の良い点・悪い点、そして次に何を考えるべきかを教えてください。`;
  } else {
    userContent = `${context}

ユーザーの質問: ${userMessage}`;
  }

  return { system: SYSTEM_PROMPT, userContent };
}
