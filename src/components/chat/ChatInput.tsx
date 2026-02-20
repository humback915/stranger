"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { sendMessage } from "@/actions/chat";

interface ChatInputProps {
  matchId: number;
}

export default function ChatInput({ matchId }: ChatInputProps) {
  const t = useTranslations("chat");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || isPending) return;

    setError("");
    startTransition(async () => {
      const result = await sendMessage(matchId, trimmed);
      if (result.error) {
        setError(result.error);
      } else {
        setContent("");
        inputRef.current?.focus();
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-stranger-mid px-4 py-3">
      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          rows={1}
          maxLength={500}
          className="flex-1 resize-none rounded-xl bg-stranger-mid px-4 py-2.5 text-sm text-stranger-light placeholder-gray-500 outline-none focus:ring-1 focus:ring-stranger-accent"
          style={{ maxHeight: "120px", overflowY: "auto" }}
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isPending}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-stranger-accent text-white disabled:opacity-40"
        >
          {isPending ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
