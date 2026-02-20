"use client";

import { useState, useTransition } from "react";
import { getUsers, banUser, unbanUser } from "@/actions/admin";

type UserRow = {
  id: string;
  phone: string;
  nickname: string;
  gender: string;
  birth_year: number;
  occupation: string;
  activity_area: string;
  status: string;
  no_show_count: number;
  is_admin: boolean;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  paused: "bg-yellow-500/20 text-yellow-400",
  banned: "bg-red-500/20 text-red-400",
};

export default function UsersClient({
  initialUsers,
}: {
  initialUsers: UserRow[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    startTransition(async () => {
      const result = await getUsers(search || undefined);
      if (!result.error) {
        setUsers(result.users as UserRow[]);
      }
    });
  };

  const handleBan = (userId: string) => {
    startTransition(async () => {
      const result = await banUser(userId);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, status: "banned" } : u
          )
        );
      }
    });
  };

  const handleUnban = (userId: string) => {
    startTransition(async () => {
      const result = await unbanUser(userId);
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, status: "active" } : u
          )
        );
      }
    });
  };

  return (
    <div>
      {/* 검색 */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="닉네임 또는 전화번호 검색"
          className="flex-1 rounded-lg bg-stranger-mid px-3 py-2 text-sm text-stranger-light placeholder-gray-500 outline-none focus:ring-1 focus:ring-stranger-accent"
        />
        <button
          onClick={handleSearch}
          disabled={isPending}
          className="rounded-lg bg-stranger-accent px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          검색
        </button>
      </div>

      {isPending && (
        <p className="mb-2 text-xs text-gray-400">로딩 중...</p>
      )}

      {/* 사용자 목록 */}
      <div className="space-y-2">
        {users.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            사용자가 없습니다
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-xl bg-stranger-mid p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stranger-light">
                    {user.nickname}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs ${
                      STATUS_COLORS[user.status] ?? ""
                    }`}
                  >
                    {user.status}
                  </span>
                  {user.is_admin && (
                    <span className="rounded-md bg-stranger-accent/20 px-2 py-0.5 text-xs text-stranger-accent">
                      관리자
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {user.phone} · {user.occupation} · {user.activity_area}
                </p>
                <p className="text-xs text-gray-500">
                  노쇼 {user.no_show_count}회 ·{" "}
                  {new Date(user.created_at).toLocaleDateString("ko-KR")}
                </p>
              </div>

              <div>
                {user.status === "banned" ? (
                  <button
                    onClick={() => handleUnban(user.id)}
                    disabled={isPending}
                    className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs text-green-400 transition-colors hover:bg-green-500/30 disabled:opacity-50"
                  >
                    차단 해제
                  </button>
                ) : (
                  <button
                    onClick={() => handleBan(user.id)}
                    disabled={isPending || user.is_admin}
                    className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50"
                  >
                    차단
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
