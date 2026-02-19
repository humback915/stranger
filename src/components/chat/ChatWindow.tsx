"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ChatInput from "./ChatInput";

interface Message {
  id: number;
  match_id: number;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatWindowProps {
  matchId: number;
  currentUserId: string;
  initialMessages: Message[];
}

export default function ChatWindow({
  matchId,
  currentUserId,
  initialMessages,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 새 메시지 수신 시 맨 아래로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Supabase Realtime 구독
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`match-chat:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // 중복 방지
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">
            첫 메시지를 보내보세요!
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMine
                    ? "rounded-br-sm bg-stranger-accent text-white"
                    : "rounded-bl-sm bg-stranger-mid text-stranger-light"
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    isMine ? "text-white/60" : "text-gray-500"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <ChatInput matchId={matchId} />
    </div>
  );
}
