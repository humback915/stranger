import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // pending 상태이고 만료된 매칭 조회
  const { data: expiredMatches, error: fetchError } = await supabase
    .from("matches")
    .select("id, user_a_id, user_b_id")
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString());

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!expiredMatches || expiredMatches.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const ids = expiredMatches.map((m) => m.id);

  // 일괄 expired 처리
  const { error: updateError } = await supabase
    .from("matches")
    .update({ status: "expired" })
    .in("id", ids);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 양쪽 사용자에게 만료 알림 전송
  const notifications = expiredMatches.flatMap((m) => [
    {
      user_id: m.user_a_id,
      type: "match_expired" as const,
      title: "매칭이 만료되었습니다",
      body: "7일 내 응답이 없어 매칭이 만료되었습니다",
      related_match_id: m.id,
      related_mission_id: null,
      is_read: false,
    },
    {
      user_id: m.user_b_id,
      type: "match_expired" as const,
      title: "매칭이 만료되었습니다",
      body: "7일 내 응답이 없어 매칭이 만료되었습니다",
      related_match_id: m.id,
      related_mission_id: null,
      is_read: false,
    },
  ]);

  await supabase.from("notifications").insert(notifications);

  return NextResponse.json({ processed: expiredMatches.length });
}
