"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * 특정 매칭의 최근 메시지 100개 조회
 */
export async function getMessages(matchId: number) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다", messages: [] };
  }

  // 매칭 권한 확인
  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a_id, user_b_id, status")
    .eq("id", matchId)
    .single();

  if (!match) {
    return { error: "매칭을 찾을 수 없습니다", messages: [] };
  }

  const isParticipant =
    match.user_a_id === user.id || match.user_b_id === user.id;

  if (!isParticipant) {
    return { error: "이 매칭의 참가자가 아닙니다", messages: [] };
  }

  if (match.status !== "accepted" && match.status !== "completed") {
    return { error: "채팅은 매칭 성사 후 이용 가능합니다", messages: [] };
  }

  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, match_id, sender_id, content, created_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    return { error: error.message, messages: [] };
  }

  return { messages: messages ?? [] };
}

/**
 * 메시지 전송
 */
export async function sendMessage(matchId: number, content: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return { error: "메시지 내용을 입력해주세요" };
  }

  if (trimmed.length > 500) {
    return { error: "메시지는 500자 이내로 입력해주세요" };
  }

  // 매칭 권한 확인 (accepted 상태만 전송 가능)
  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a_id, user_b_id, status")
    .eq("id", matchId)
    .single();

  if (!match) {
    return { error: "매칭을 찾을 수 없습니다" };
  }

  const isParticipant =
    match.user_a_id === user.id || match.user_b_id === user.id;

  if (!isParticipant) {
    return { error: "이 매칭의 참가자가 아닙니다" };
  }

  if (match.status !== "accepted") {
    return { error: "채팅은 매칭 성사(accepted) 상태에서만 가능합니다" };
  }

  const { error } = await supabase.from("messages").insert({
    match_id: matchId,
    sender_id: user.id,
    content: trimmed,
  });

  if (error) {
    return { error: error.message };
  }

  // 상대방에게 푸시 알림 전송
  const partnerId =
    match.user_a_id === user.id ? match.user_b_id : match.user_a_id;

  try {
    const { sendPushToUser } = await import("@/actions/push");
    await sendPushToUser(
      partnerId,
      "새 메시지",
      trimmed.length > 50 ? `${trimmed.slice(0, 50)}...` : trimmed,
      { url: `/matches/${matchId}/chat` }
    );
  } catch {
    // 푸시 실패는 무시
  }

  return { success: true };
}
