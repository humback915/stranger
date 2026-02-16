"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadProfilePhoto(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "파일이 없습니다" };
  }

  // 파일 크기 제한 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "파일 크기는 5MB 이하여야 합니다" };
  }

  // 이미지 타입 확인
  if (!file.type.startsWith("image/")) {
    return { error: "이미지 파일만 업로드할 수 있습니다" };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl };
}

export async function deleteProfilePhoto(url: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  // URL에서 파일 경로 추출
  const path = url.split("/profile-photos/").pop();
  if (!path || !path.startsWith(user.id)) {
    return { error: "삭제 권한이 없습니다" };
  }

  const { error } = await supabase.storage
    .from("profile-photos")
    .remove([path]);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
