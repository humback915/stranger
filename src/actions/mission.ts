"use server";

import { createClient } from "@/lib/supabase/server";
import { departureConfirmSchema } from "@/lib/validations/mission";

export async function confirmDeparture(missionId: number) {
  const parsed = departureConfirmSchema.safeParse({ mission_id: missionId });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  // 미션 조회 + 매치 정보로 user_a/user_b 확인
  const { data: mission, error: missionError } = await supabase
    .from("missions")
    .select("id, match_id, status, meeting_date, meeting_time")
    .eq("id", missionId)
    .single();

  if (missionError || !mission) {
    return { error: "미션을 찾을 수 없습니다" };
  }

  if (mission.status !== "scheduled") {
    return { error: "출발 확인할 수 없는 미션 상태입니다" };
  }

  // 만남 시간 1시간 전부터만 확인 가능
  const meetingDateTime = new Date(
    `${mission.meeting_date}T${mission.meeting_time}`
  );
  const oneHourBefore = new Date(meetingDateTime.getTime() - 60 * 60 * 1000);
  const now = new Date();

  if (now < oneHourBefore) {
    return { error: "만남 1시간 전부터 출발 확인이 가능합니다" };
  }

  // 매치 정보에서 user_a/user_b 확인
  const { data: match } = await supabase
    .from("matches")
    .select("user_a_id, user_b_id")
    .eq("id", mission.match_id)
    .single();

  if (!match) {
    return { error: "매치 정보를 찾을 수 없습니다" };
  }

  const isUserA = match.user_a_id === user.id;
  const isUserB = match.user_b_id === user.id;

  if (!isUserA && !isUserB) {
    return { error: "이 미션의 참가자가 아닙니다" };
  }

  // 미션 출발 확인 업데이트
  const updateField = isUserA
    ? { user_a_departure_confirmed: true }
    : { user_b_departure_confirmed: true };

  const { error: updateError } = await supabase
    .from("missions")
    .update(updateField)
    .eq("id", missionId);

  if (updateError) {
    return { error: updateError.message };
  }

  // no_show_checks 업데이트
  const { error: checkError } = await supabase
    .from("no_show_checks")
    .update({
      status: "confirmed" as const,
      confirmed_at: new Date().toISOString(),
    })
    .eq("mission_id", missionId)
    .eq("user_id", user.id);

  if (checkError) {
    return { error: checkError.message };
  }

  return { success: true };
}

export async function checkNoShow(missionId: number) {
  const supabase = createClient();

  // 데드라인이 지난 미확인 no_show_checks 조회
  const { data: pendingChecks } = await supabase
    .from("no_show_checks")
    .select("id, user_id, check_deadline")
    .eq("mission_id", missionId)
    .eq("status", "pending");

  if (!pendingChecks || pendingChecks.length === 0) {
    return { success: true, noShows: [] };
  }

  const now = new Date();
  const noShowUserIds: string[] = [];

  for (const check of pendingChecks) {
    if (new Date(check.check_deadline) < now) {
      // no_show 처리
      await supabase
        .from("no_show_checks")
        .update({ status: "no_show" as const })
        .eq("id", check.id);

      // 프로필 no_show_count 증가
      const { data: profile } = await supabase
        .from("profiles")
        .select("no_show_count")
        .eq("id", check.user_id)
        .single();

      if (profile) {
        const newCount = profile.no_show_count + 1;
        const updateData: { no_show_count: number; status?: "banned" } = {
          no_show_count: newCount,
        };

        // 3회 이상 노쇼 시 계정 정지
        if (newCount >= 3) {
          updateData.status = "banned";
        }

        await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", check.user_id);
      }

      noShowUserIds.push(check.user_id);
    }
  }

  return { success: true, noShows: noShowUserIds };
}

export async function getMission(missionId: number) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const { data: mission, error } = await supabase
    .from("missions")
    .select(
      "id, match_id, place_name, place_address, place_lat, place_lng, place_category, user_a_prop_category, user_a_prop_name, user_a_prop_description, user_b_prop_category, user_b_prop_name, user_b_prop_description, user_a_action, user_b_action, meeting_date, meeting_time, user_a_departure_confirmed, user_b_departure_confirmed, status, created_at, updated_at"
    )
    .eq("id", missionId)
    .single();

  if (error || !mission) {
    return { error: "미션을 찾을 수 없습니다" };
  }

  // 매치 정보 조회
  const { data: match } = await supabase
    .from("matches")
    .select("user_a_id, user_b_id")
    .eq("id", mission.match_id)
    .single();

  if (!match) {
    return { error: "매치 정보를 찾을 수 없습니다" };
  }

  const isUserA = match.user_a_id === user.id;
  const isUserB = match.user_b_id === user.id;

  if (!isUserA && !isUserB) {
    return { error: "이 미션의 참가자가 아닙니다" };
  }

  const partnerId = isUserA ? match.user_b_id : match.user_a_id;

  // 상대 닉네임 조회
  const { data: partnerProfile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", partnerId)
    .single();

  return {
    mission,
    role: isUserA ? ("user_a" as const) : ("user_b" as const),
    partnerId,
    partnerNickname: partnerProfile?.nickname ?? "",
  };
}
