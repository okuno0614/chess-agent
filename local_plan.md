# Chess Coach AI - Implementation Plan

## 1. Project Overview

自然言語でAIと相談しながらチェスを学習できるWebアプリを構築する。

目的は「最善手を教える」ことではなく、
ユーザーが考えた手をAIと議論し、理由を理解しながら上達すること。

AIの役割:

- 戦略の解説
- 候補手比較
- 初心者向けコーチング
- 思考の壁打ち

Stockfishの役割:

- 正確な評価
- 最善手探索
- 候補手順位
- tactical validation

基本思想:

- 計算 → Stockfish
- 説明 → LLM
- UI → 対話型コーチ


---

# 2. MVP Scope

実装対象:

- インタラクティブチェス盤
- 指し手入力
- 自動合法手判定
- 局面管理
- Stockfish解析
- チャットUI
- AI解説
- 候補手比較
- 履歴管理

MVPで不要:

- ユーザー認証
- DB永続化
- レーティング
- マルチプレイ
- opening DB
- puzzle mode
- 音声
- mobile native app


---

# 3. Tech Stack

Frontend:
- Next.js 15
- React
- TypeScript
- TailwindCSS

Chess UI:
- react-chessboard

Chess Logic:
- chess.js

Engine:
- Stockfish WASM (browser worker)

LLM:
- OpenAI Responses API

State:
- Zustand

Streaming:
- Vercel AI SDK

Deployment:
- Vercel


---

# 4. Core User Flow

## New Game

User opens app
→ initial board rendered
→ AI greets and explains mode

---

## Move Discussion

User makes move OR types candidate move

Example:

"I’m considering d4 here"

System:

1. Parse move
2. Validate legality
3. Run Stockfish analysis
4. Compare with top engine choices
5. Send structured prompt to LLM
6. Return coaching explanation

Response example:

"Interesting idea.
d4 contests the center aggressively, but Stockfish slightly prefers Nf3 because it develops while preserving flexibility..."

---

## Ask Position Question

User asks:

- "Who's better?"
- "Why not castle?"
- "What should I focus on?"

System gathers:

- FEN
- evaluation
- top 3 lines
- move history

Feeds to LLM for explanation.

---

# 5. Architecture

## Frontend Layer

Responsibilities:

- Render board
- Handle drag/drop
- Chat interface
- Move history
- Analysis display

Components:

/components
  ChessBoard.tsx
  ChatPanel.tsx
  MoveHistory.tsx
  EvaluationBar.tsx
  CandidateLines.tsx

---

## Game State Layer

/store/game.ts

State:

- fen
- moveHistory
- selectedMove
- analysis
- chatMessages
- thinking

Actions:

- makeMove()
- undo()
- reset()
- analyze()
- sendChat()

---

## Engine Layer

/lib/engine.ts

Responsibilities:

- initialize worker
- send UCI commands
- parse responses
- extract:

  - eval cp/mate
  - pv lines
  - bestmove
  - depth

API:

analyzePosition(fen, depth)

returns:

{
  evaluation,
  bestMove,
  multiPv
}

---

## AI Layer

/lib/coach.ts

Responsibilities:

- Build context prompt
- Inject engine analysis
- Stream response

Input:

{
 fen,
 history,
 eval,
 candidateLines,
 userQuestion
}

Output:

natural coaching explanation

Prompt rules:

- never hallucinate legality
- rely on engine truth
- explain simply
- compare alternatives
- encourage reasoning

---

# 6. Prompt Design

System prompt:

You are an expert chess coach.

Rules:
- Explain clearly for intermediate beginners
- Never invent legal moves
- Respect Stockfish analysis as ground truth
- Compare options strategically
- Encourage learning
- Be conversational but concise

Response style:

- explain strategic idea
- explain tactical risks
- suggest focus area

---

# 7. API Contract

POST /api/chat

Input:

{
  fen,
  history,
  engineAnalysis,
  message
}

Output stream:

assistant response

---

# 8. Implementation Phases

# Phase 1

Board rendering

Acceptance:
- pieces movable
- legal validation works

---

# Phase 2

Stockfish integration

Acceptance:
- eval visible
- best move displayed
- multiPV works

---

# Phase 3

Chat UI

Acceptance:
- user sends question
- streaming response renders

---

# Phase 4

AI coaching integration

Acceptance:
- response grounded in engine analysis

---

# Phase 5

Move suggestion discussion

Acceptance:

user types:

"what about d4?"

system compares against engine

returns explanation

---

# Phase 6

UX polish

- loading indicators
- board orientation toggle
- move highlight
- analysis depth control

---

# 9. Folder Structure

/src
  /app
    /api/chat
  /components
  /lib
    engine.ts
    coach.ts
    chess.ts
  /store
    game.ts
  /types

---

# 10. Edge Cases

Must handle:

Illegal move:
- explain why illegal

Ambiguous SAN:
- ask clarification

Engine timeout:
- graceful fallback

LLM timeout:
- retry once

Worker crash:
- reinitialize engine

---

# 11. Performance Constraints

Target:

First load:
< 3 sec

Analysis:
< 2 sec depth 15

Chat response:
stream within 1 sec

No memory leaks from workers.

---

# 12. Testing Requirements

Unit:

- move validation
- fen sync
- parser correctness

Integration:

- engine worker messaging
- API streaming

E2E:

- full game flow
- ask coaching question
- receive response

---

# 13. Stretch Goals

Future:

- opening trainer
- mistake classification
- "guess best move"
- spaced repetition
- user improvement analytics
- voice coach mode
- PGN import/export
- Lichess sync

---

# 14. Success Criteria

App succeeds if:

A beginner can:

1. play a move
2. ask why it was good/bad
3. receive useful explanation
4. understand improvement ideas

without reading external material.