"use client";

import { useRef, useEffect } from "react";
import { useGameStore } from "@/store/game";

export function ChatPanel({
  onUserMessage,
  onCoachRequest,
}: {
  onUserMessage: (msg: string) => void;
  onCoachRequest: () => void;
}) {
  const chatMessages = useGameStore((s) => s.chatMessages);
  const aiResponding = useGameStore((s) => s.aiResponding);
  const pendingCoachContext = useGameStore((s) => s.pendingCoachContext);
  const analysis = useGameStore((s) => s.analysis);
  const autoCoachMode = useGameStore((s) => s.autoCoachMode);
  const setAutoCoachMode = useGameStore((s) => s.setAutoCoachMode);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputRef.current?.value.trim();
    if (!val || aiResponding) return;
    if (inputRef.current) inputRef.current.value = "";
    onUserMessage(val);
  };

  const canCoach = !aiResponding && analysis !== null;
  const hasPending = pendingCoachContext !== null;

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-700 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase">
          AIコーチ
        </h3>
        <div className="flex items-center gap-2">
          {/* Auto-coach mode toggle */}
          <button
            onClick={() => setAutoCoachMode(!autoCoachMode)}
            title={autoCoachMode ? "自動解説ON（クリックでOFFに）" : "自動解説OFF（クリックでONに）"}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
              autoCoachMode
                ? "bg-green-700 hover:bg-green-600 text-green-100"
                : "bg-gray-700 hover:bg-gray-600 text-gray-400"
            }`}
          >
            <span>{autoCoachMode ? "⚡" : "✋"}</span>
            <span>{autoCoachMode ? "自動" : "手動"}</span>
          </button>
          {/* Manual coach button */}
          <button
            onClick={onCoachRequest}
            disabled={!canCoach}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${
              hasPending
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:bg-gray-700"
            }`}
          >
            🤖
            {hasPending ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                解説してもらう
              </span>
            ) : (
              "局面を聞く"
            )}
          </button>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatMessages.length === 0 && (
          <p className="text-sm text-gray-600 text-center mt-4">
            駒を動かすと自動で解説が始まります
          </p>
        )}
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-100"
              }`}
            >
              {msg.content ? (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              ) : (
                <span className="animate-pulse text-gray-400">
                  考え中...
                </span>
              )}
              {msg.isStreaming && msg.content && (
                <span className="inline-block w-1 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 p-3 border-t border-gray-700"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={aiResponding ? "AIが考え中..." : "質問を入力 (例: なぜd4が良いの?)"}
          disabled={aiResponding}
          className="flex-1 bg-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={aiResponding}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          送信
        </button>
      </form>
    </div>
  );
}
