import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import type { EngineAnalysis, MoveRecord, OpeningInfo } from "@/types";
import { buildCoachPrompt } from "@/lib/coach";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    fen,
    moveHistory,
    engineAnalysis,
    message,
    isAutoAnalysis,
    opening,
    isOpponentMove,
    playerColor,
    playerMove,
    opponentMove,
    batchMode,
  }: {
    fen: string;
    moveHistory: MoveRecord[];
    engineAnalysis: EngineAnalysis;
    message: string;
    isAutoAnalysis: boolean;
    opening?: OpeningInfo | null;
    isOpponentMove?: boolean;
    playerColor?: "white" | "black";
    playerMove?: MoveRecord | null;
    opponentMove?: MoveRecord | null;
    batchMode?: boolean;
  } = body;

  const { system, userContent } = buildCoachPrompt({
    fen,
    moveHistory,
    analysis: engineAnalysis,
    userMessage: message,
    isAutoAnalysis,
    opening,
    isOpponentMove,
    playerColor,
    playerMove,
    opponentMove,
    batchMode,
  });

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  const result = streamText({
    model: openai(model),
    system,
    messages: [{ role: "user", content: userContent }],
    maxOutputTokens: batchMode ? 450 : 350,
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
