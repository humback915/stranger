import { type ReactNode } from "react";
import { AuthProvider } from "@/providers/AuthProvider";
import BottomNav from "@/components/layout/BottomNav";
import SafetyButton from "@/components/layout/SafetyButton";
import NotificationBell from "@/components/layout/NotificationBell";
import PushNotificationManager from "@/components/push/PushNotificationManager";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-stranger-dark pb-16">
        {/* 상단 헤더 */}
        <header className="sticky top-0 z-40 border-b border-stranger-mid bg-stranger-dark/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
            <span className="text-lg font-bold text-stranger-light">
              Hello, Stranger
            </span>
            <NotificationBell />
          </div>
        </header>
        <div className="mx-auto max-w-md">{children}</div>
        <SafetyButton />
        <BottomNav />
        <PushNotificationManager />
      </div>
    </AuthProvider>
  );
}
