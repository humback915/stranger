"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** 현재 사용자가 관리자인지 확인, 아니면 /home 리다이렉트 */
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/home");
  }

  return user;
}

/** 관리자 대시보드 통계 */
export async function getAdminStats() {
  const admin = createAdminClient();

  const [users, matches, missions, reports] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("matches").select("id", { count: "exact", head: true }),
    admin.from("missions").select("id", { count: "exact", head: true }),
    admin
      .from("safety_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    totalUsers: users.count ?? 0,
    totalMatches: matches.count ?? 0,
    totalMissions: missions.count ?? 0,
    pendingReports: reports.count ?? 0,
  };
}

/** 신고 목록 조회 */
export async function getReports(statusFilter?: string) {
  const admin = createAdminClient();

  let query = admin
    .from("safety_reports")
    .select(
      "id, reporter_id, reported_user_id, mission_id, report_type, description, status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter && statusFilter !== "all") {
    query = query.eq(
      "status",
      statusFilter as "pending" | "reviewing" | "resolved" | "dismissed"
    );
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, reports: [] };
  }

  // 신고자/피신고자 닉네임 조회
  const userIds = new Set<string>();
  data?.forEach((r) => {
    userIds.add(r.reporter_id);
    userIds.add(r.reported_user_id);
  });

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, nickname")
    .in("id", Array.from(userIds));

  const nicknameMap = new Map(profiles?.map((p) => [p.id, p.nickname]) ?? []);

  const reports = (data ?? []).map((r) => ({
    ...r,
    reporter_nickname: nicknameMap.get(r.reporter_id) ?? "알 수 없음",
    reported_nickname: nicknameMap.get(r.reported_user_id) ?? "알 수 없음",
  }));

  return { reports };
}

/** 신고 상태 변경 */
export async function updateReportStatus(
  reportId: number,
  newStatus: "pending" | "reviewing" | "resolved" | "dismissed"
) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("safety_reports")
    .update({ status: newStatus })
    .eq("id", reportId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/** 사용자 목록 조회 */
export async function getUsers(search?: string) {
  const admin = createAdminClient();

  let query = admin
    .from("profiles")
    .select(
      "id, phone, nickname, gender, birth_year, occupation, activity_area, status, no_show_count, is_admin, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (search) {
    query = query.or(
      `nickname.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, users: [] };
  }

  return { users: data ?? [] };
}

/** 사용자 차단 */
export async function banUser(userId: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ status: "banned" as const })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/** 사용자 차단 해제 */
export async function unbanUser(userId: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ status: "active" as const })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/** 노쇼 현황 조회 */
export async function getNoShows() {
  const admin = createAdminClient();

  const { data: checks, error } = await admin
    .from("no_show_checks")
    .select("id, mission_id, user_id, status, check_deadline, confirmed_at, created_at")
    .eq("status", "no_show")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return { error: error.message, noShows: [] };
  }

  // 유저 닉네임 조회
  const userIds = Array.from(new Set(checks?.map((c) => c.user_id) ?? []));
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, nickname, no_show_count, status")
    .in("id", userIds);

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  const noShows = (checks ?? []).map((c) => ({
    ...c,
    nickname: profileMap.get(c.user_id)?.nickname ?? "알 수 없음",
    total_no_shows: profileMap.get(c.user_id)?.no_show_count ?? 0,
    user_status: profileMap.get(c.user_id)?.status ?? "unknown",
  }));

  return { noShows };
}
