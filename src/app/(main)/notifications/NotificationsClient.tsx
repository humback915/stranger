"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { markAsRead, markAllAsRead } from "@/actions/notification";
import { ROUTES } from "@/lib/constants/routes";

interface Notification {
  id: number;
  user_id: string;
  type: "match_new" | "match_accepted" | "match_rejected" | "mission_created" | "match_expired" | "no_show";
  title: string;
  body: string;
  related_match_id: number | null;
  related_mission_id: number | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  match_new: { icon: "heart", color: "bg-pink-500/20 text-pink-400" },
  match_accepted: { icon: "check", color: "bg-green-500/20 text-green-400" },
  match_rejected: { icon: "x", color: "bg-red-500/20 text-red-400" },
  mission_created: { icon: "flag", color: "bg-blue-500/20 text-blue-400" },
};

function NotificationIcon({ type }: { type: string }) {
  const config = TYPE_ICONS[type] || TYPE_ICONS.match_new;

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.color}`}
    >
      {type === "match_new" && (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )}
      {type === "match_accepted" && (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === "match_rejected" && (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {type === "mission_created" && (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
        </svg>
      )}
    </div>
  );
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function getNotificationLink(notification: Notification): string {
  if (notification.related_mission_id) {
    return ROUTES.MISSION_DETAIL(notification.related_mission_id);
  }
  if (notification.related_match_id) {
    return ROUTES.MATCHES;
  }
  return ROUTES.HOME;
}

export default function NotificationsClient({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = (id: number) => {
    startTransition(async () => {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    });
  };

  return (
    <div className="px-4 pb-24 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stranger-light">알림</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            className="text-xs text-stranger-accent disabled:opacity-50"
          >
            모두 읽음 처리
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stranger-mid">
            <svg
              className="h-8 w-8 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-stranger-light">
            알림이 없습니다
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            매칭이나 미션 관련 소식이 여기에 표시됩니다
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={getNotificationLink(notification)}
              onClick={() => {
                if (!notification.is_read) {
                  handleMarkAsRead(notification.id);
                }
              }}
              className={`flex items-start gap-3 rounded-xl p-4 transition-colors ${
                notification.is_read
                  ? "bg-stranger-mid/50"
                  : "bg-stranger-mid"
              }`}
            >
              <NotificationIcon type={notification.type} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-medium ${
                      notification.is_read
                        ? "text-gray-400"
                        : "text-stranger-light"
                    }`}
                  >
                    {notification.title}
                  </p>
                  {!notification.is_read && (
                    <div className="h-2 w-2 shrink-0 rounded-full bg-stranger-accent" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                  {notification.body}
                </p>
                <p className="mt-1 text-[10px] text-gray-600">
                  {formatTime(notification.created_at)}
                </p>
              </div>
              <svg
                className="mt-1 h-4 w-4 shrink-0 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
