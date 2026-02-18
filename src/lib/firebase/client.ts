import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !projectId || !messagingSenderId || !appId) {
    return null;
  }

  if (getApps().length === 0) {
    app = initializeApp({
      apiKey,
      authDomain: `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: `${projectId}.firebasestorage.app`,
      messagingSenderId,
      appId,
    });
  } else {
    app = getApps()[0];
  }

  return app;
}

function getFirebaseMessaging(): Messaging | null {
  if (messaging) return messaging;
  if (typeof window === "undefined") return null;

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  try {
    messaging = getMessaging(firebaseApp);
    return messaging;
  } catch {
    return null;
  }
}

/** FCM 푸시 토큰 요청 (브라우저 알림 권한 포함) */
export async function requestPushToken(): Promise<string | null> {
  const msg = getFirebaseMessaging();
  if (!msg) return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(msg, { vapidKey });
    return token || null;
  } catch (error) {
    console.error("[FCM] Failed to get push token:", error);
    return null;
  }
}

/** 포그라운드 메시지 리스너 등록 */
export function onForegroundMessage(callback: (payload: { title?: string; body?: string }) => void) {
  const msg = getFirebaseMessaging();
  if (!msg) return () => {};

  return onMessage(msg, (payload) => {
    callback({
      title: payload.notification?.title,
      body: payload.notification?.body,
    });
  });
}
