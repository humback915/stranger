import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/actions/push";
import { isCronAuthorized } from "@/lib/cron-auth";

/**
 * 출발 리마인더 크론 엔드포인트
 * 10분 간격으로 호출하여 만남 1시간 전 미확인 사용자에게 알림 전송
 */
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // 만남 시간이 1~2시간 이내인 미확인 미션 조회
  const { data: pendingChecks } = await admin
    .from("no_show_checks")
    .select("user_id, mission_id")
    .eq("status", "pending")
    .gte("check_deadline", oneHourLater.toISOString())
    .lte("check_deadline", twoHoursLater.toISOString());

  if (!pendingChecks || pendingChecks.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;

  for (const check of pendingChecks) {
    await sendPushToUser(
      check.user_id,
      "출발 리마인더",
      "곧 만남 시간이에요! 출발 확인을 해주세요.",
      { url: `/missions/${check.mission_id}` }
    );
    sent++;
  }

  return NextResponse.json({ sent });
}
