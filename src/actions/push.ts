"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminMessaging } from "@/lib/firebase/admin";

/** 푸시 구독 저장 (로그인 시 호출) */
export async function savePushSubscription(
  fcmToken: string,
  deviceInfo?: string
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      fcm_token: fcmToken,
      device_info: deviceInfo ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,fcm_token" }
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/** 푸시 구독 제거 */
export async function removePushSubscription(fcmToken: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("fcm_token", fcmToken);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/** 특정 사용자에게 푸시 알림 전송 (서버에서 호출) */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const messaging = getAdminMessaging();
  if (!messaging) return; // Firebase 미설정 시 스킵

  const admin = createAdminClient();

  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("id, fcm_token")
    .eq("user_id", userId);

  if (!subscriptions || subscriptions.length === 0) return;

  const expiredTokenIds: number[] = [];

  for (const sub of subscriptions) {
    try {
      await messaging.send({
        token: sub.fcm_token,
        notification: { title, body },
        data: data ?? {},
        webpush: {
          fcmOptions: {
            link: data?.url ?? "/home",
          },
        },
      });
    } catch (error: unknown) {
      // 만료된 토큰 정리
      const errCode =
        error && typeof error === "object" && "code" in error
          ? (error as { code: string }).code
          : "";
      if (
        errCode === "messaging/registration-token-not-registered" ||
        errCode === "messaging/invalid-registration-token"
      ) {
        expiredTokenIds.push(sub.id);
      }
    }
  }

  // 만료된 토큰 삭제
  if (expiredTokenIds.length > 0) {
    await admin
      .from("push_subscriptions")
      .delete()
      .in("id", expiredTokenIds);
  }
}
