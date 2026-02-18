"use client";

import { useEffect, useRef } from "react";
import { requestPushToken, onForegroundMessage } from "@/lib/firebase/client";
import { savePushSubscription } from "@/actions/push";

export default function PushNotificationManager() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      // Service Worker에 Firebase config 전달
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
          );

          const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
          const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
          const messagingSenderId =
            process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
          const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

          if (apiKey && projectId && messagingSenderId && appId) {
            registration.active?.postMessage({
              type: "FIREBASE_CONFIG",
              config: {
                apiKey,
                authDomain: `${projectId}.firebaseapp.com`,
                projectId,
                storageBucket: `${projectId}.firebasestorage.app`,
                messagingSenderId,
                appId,
              },
            });
          }
        } catch {
          // Service Worker 등록 실패 무시
        }
      }

      // FCM 토큰 요청 + 서버 저장
      const token = await requestPushToken();
      if (token) {
        const deviceInfo = navigator.userAgent.slice(0, 200);
        await savePushSubscription(token, deviceInfo);
      }
    }

    init();

    // 포그라운드 메시지 처리
    const unsubscribe = onForegroundMessage((payload) => {
      if (Notification.permission === "granted" && payload.title) {
        new Notification(payload.title, {
          body: payload.body ?? "",
          icon: "/favicon.ico",
        });
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return null;
}
