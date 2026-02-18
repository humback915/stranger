/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Firebase config는 환경변수를 사용할 수 없으므로 postMessage로 수신
let firebaseConfig = null;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FIREBASE_CONFIG") {
    firebaseConfig = event.data.config;
    initFirebase();
  }
});

function initFirebase() {
  if (!firebaseConfig) return;

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "Hello, Stranger";
    const options = {
      body: payload.notification?.body || "",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: payload.data,
    };

    self.registration.showNotification(title, options);
  });
}

// 알림 클릭 시 앱으로 이동
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/home";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});
