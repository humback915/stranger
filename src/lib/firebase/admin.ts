import {
  initializeApp,
  getApps,
  cert,
  type App,
} from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

let app: App | null = null;

function getFirebaseAdminApp(): App | null {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    app = getApps()[0];
  }

  return app;
}

/** Firebase Admin Messaging 인스턴스 (미설정 시 null) */
export function getAdminMessaging(): Messaging | null {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) return null;

  try {
    return getMessaging(adminApp);
  } catch {
    return null;
  }
}
