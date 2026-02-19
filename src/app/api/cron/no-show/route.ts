import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";
import { sendPushToUser } from "@/actions/push";
import { isCronAuthorized } from "@/lib/cron-auth";

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // 데드라인이 지난 pending 노쇼 체크 일괄 조회
  const { data: pendingChecks, error: fetchError } = await admin
    .from("no_show_checks")
    .select("id, user_id, mission_id")
    .eq("status", "pending")
    .lt("check_deadline", now);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!pendingChecks || pendingChecks.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  // no_show 처리 + no_show_count 증가
  const noShowMissionIds = new Set<number>();

  for (const check of pendingChecks) {
    // no_show_checks 상태 변경
    await admin
      .from("no_show_checks")
      .update({ status: "no_show" })
      .eq("id", check.id);

    // 프로필 no_show_count 증가 (3회 이상 시 계정 정지)
    const { data: profile } = await admin
      .from("profiles")
      .select("no_show_count")
      .eq("id", check.user_id)
      .single();

    if (profile) {
      const newCount = profile.no_show_count + 1;
      const updateData: { no_show_count: number; status?: "banned" } = {
        no_show_count: newCount,
      };
      if (newCount >= 3) {
        updateData.status = "banned";
      }
      await admin.from("profiles").update(updateData).eq("id", check.user_id);
    }

    noShowMissionIds.add(check.mission_id);
  }

  // 노쇼 발생 미션 → cancelled + 양쪽 알림
  for (const missionId of Array.from(noShowMissionIds)) {
    await admin
      .from("missions")
      .update({ status: "cancelled" })
      .eq("id", missionId);

    // 매칭 양쪽 사용자 조회
    const { data: mission } = await admin
      .from("missions")
      .select("match_id")
      .eq("id", missionId)
      .single();

    if (!mission) continue;

    const { data: match } = await admin
      .from("matches")
      .select("user_a_id, user_b_id")
      .eq("id", mission.match_id)
      .single();

    if (!match) continue;

    const noShowUserIdsInMission = pendingChecks
      .filter((c) => c.mission_id === missionId)
      .map((c) => c.user_id);

    const notifications = [match.user_a_id, match.user_b_id].map((userId) => {
      const isNoShow = noShowUserIdsInMission.includes(userId);
      return {
        user_id: userId,
        type: "no_show" as const,
        title: "미션이 취소되었습니다",
        body: isNoShow
          ? "출발 확인을 하지 않아 노쇼로 처리되었습니다"
          : "상대방이 나타나지 않아 미션이 취소되었습니다",
        related_match_id: mission.match_id,
        related_mission_id: missionId,
        is_read: false,
      };
    });

    await admin.from("notifications").insert(notifications);

    // 푸시 알림
    await Promise.all(
      [match.user_a_id, match.user_b_id].map((userId) => {
        const isNoShow = noShowUserIdsInMission.includes(userId);
        return sendPushToUser(
          userId,
          "미션이 취소되었습니다",
          isNoShow
            ? "출발 확인을 하지 않아 노쇼로 처리되었습니다"
            : "상대방이 나타나지 않아 미션이 취소되었습니다",
          { url: `/missions/${missionId}` }
        );
      })
    );
  }

  return NextResponse.json({ processed: pendingChecks.length });
}
