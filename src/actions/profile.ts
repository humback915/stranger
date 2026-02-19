"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

export async function getMyProfile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, phone, nickname, birth_year, gender, occupation, mbti, hobbies, personality, ideal_type, photo_urls, activity_area, preferred_gender, preferred_age_min, preferred_age_max, preferred_distance_km, status, no_show_count, created_at"
    )
    .eq("id", user.id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { profile };
}

export async function createProfile(
  profileData: Omit<ProfileInsert, "id" | "phone">
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    phone: user.phone ?? "",
    ...profileData,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateProfile(
  data: Database["public"]["Tables"]["profiles"]["Update"]
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
