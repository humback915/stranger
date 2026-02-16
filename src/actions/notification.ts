"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMyNotifications() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다", notifications: [] as Notification[] };
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("id, user_id, type, title, body, related_match_id, related_mission_id, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { error: error.message, notifications: [] as Notification[] };
  }

  return { notifications: (notifications ?? []) as Notification[] };
}

type Notification = {
  id: number;
  user_id: string;
  type: "match_new" | "match_accepted" | "match_rejected" | "mission_created";
  title: string;
  body: string;
  related_match_id: number | null;
  related_mission_id: number | null;
  is_read: boolean;
  created_at: string;
};

export async function getUnreadCount() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { count: 0 };
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    return { count: 0 };
  }

  return { count: count ?? 0 };
}

export async function markAsRead(notificationId: number) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function markAllAsRead() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/** 내부 헬퍼: 알림 생성 (서버 액션에서 호출) */
export async function createNotification(params: {
  userId: string;
  type: "match_new" | "match_accepted" | "match_rejected" | "mission_created";
  title: string;
  body: string;
  relatedMatchId?: number | null;
  relatedMissionId?: number | null;
}) {
  const supabase = createClient();

  await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    related_match_id: params.relatedMatchId ?? null,
    related_mission_id: params.relatedMissionId ?? null,
  });
}
