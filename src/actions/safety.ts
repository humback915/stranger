"use server";

import { createClient } from "@/lib/supabase/server";
import { safetyReportSchema, type SafetyReportInput } from "@/lib/validations/safety";

export async function submitSafetyReport(input: SafetyReportInput) {
  const parsed = safetyReportSchema.safeParse(input);
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

  if (user.id === parsed.data.reported_user_id) {
    return { error: "자기 자신을 신고할 수 없습니다" };
  }

  const { error } = await supabase.from("safety_reports").insert({
    reporter_id: user.id,
    reported_user_id: parsed.data.reported_user_id,
    mission_id: parsed.data.mission_id ?? null,
    report_type: parsed.data.report_type,
    description: parsed.data.description ?? null,
    reporter_lat: parsed.data.reporter_lat ?? null,
    reporter_lng: parsed.data.reporter_lng ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
