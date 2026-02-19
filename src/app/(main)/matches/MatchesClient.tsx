"use client";

import { useState, useTransition } from "react";
import { runMatching } from "@/actions/matching";
import MatchCard from "@/components/matches/MatchCard";

interface Partner {
  id: string;
  nickname: string;
  gender: string;
  birth_year: number;
  occupation: string;
  mbti: string | null;
  hobbies?: string[];
  personality?: string[];
  ideal_type?: string[];
  photo_urls?: string[];
  activity_area: string;
  preferred_gender?: string;
  preferred_age_min?: number;
  preferred_age_max?: number;
  preferred_distance_km?: number;
}

interface Match {
  id: number;
  user_a_id: string;
  user_b_id: string;
  similarity_score: number;
  compatibility_score: number;
  distance_km: number | null;
  user_a_accepted: boolean | null;
  user_b_accepted: boolean | null;
  status: string;
  created_at: string;
  role: "user_a" | "user_b";
  partner: Partner | null;
  missionId: number | null;
  lastMessage: { content: string; created_at: string; is_mine: boolean } | null;
  unreadCount: number;
}

interface MatchesClientProps {
  initialMatches: Match[];
}

export default function MatchesClient({ initialMatches }: MatchesClientProps) {
  const [matches, setMatches] = useState(initialMatches);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleFindMatch = () => {
    setMessage("");
    startTransition(async () => {
      const result = await runMatching();
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage(
          `매칭 성공! 호환도 ${result.compatibility}%, 거리 ${result.distance}km`
        );
        // 페이지 새로고침으로 새 매칭 표시
        window.location.reload();
      }
    });
  };

  const handleStatusChange = (
    matchId: number,
    newStatus: string,
    myAccepted: boolean | null,
    missionId?: number | null
  ) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        const updated = { ...m, status: newStatus, missionId: missionId ?? m.missionId };
        if (m.role === "user_a") {
          updated.user_a_accepted = myAccepted;
        } else {
          updated.user_b_accepted = myAccepted;
        }
        return updated;
      })
    );
  };

  const pendingMatches = matches.filter((m) => m.status === "pending");
  const activeMatches = matches.filter((m) =>
    ["accepted", "completed"].includes(m.status)
  );
  const pastMatches = matches.filter((m) =>
    ["rejected", "expired"].includes(m.status)
  );

  return (
    <div className="px-4 pb-24 pt-6">
      <h1 className="text-2xl font-bold text-stranger-light">매칭</h1>
      <p className="mt-1 text-sm text-gray-400">
        가치관이 맞는 상대를 찾아보세요
      </p>

      {/* 매칭 찾기 버튼 */}
      <button
        onClick={handleFindMatch}
        disabled={isPending}
        className="mt-4 w-full rounded-xl bg-stranger-accent py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            매칭 중...
          </span>
        ) : (
          "새로운 매칭 찾기"
        )}
      </button>

      {message && (
        <div
          className={`mt-3 rounded-lg px-4 py-3 text-sm ${
            message.includes("성공")
              ? "bg-green-600/10 text-green-400"
              : "bg-red-600/10 text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      {/* 대기 중인 매칭 */}
      {pendingMatches.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-medium text-gray-400">
            대기 중 ({pendingMatches.length})
          </h2>
          <div className="flex flex-col gap-3">
            {pendingMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* 활성 매칭 */}
      {activeMatches.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-medium text-gray-400">
            진행 중 ({activeMatches.length})
          </h2>
          <div className="flex flex-col gap-3">
            {activeMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* 과거 매칭 */}
      {pastMatches.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-medium text-gray-400">
            지난 매칭 ({pastMatches.length})
          </h2>
          <div className="flex flex-col gap-3">
            {pastMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {matches.length === 0 && !message && (
        <div className="mt-8 rounded-2xl bg-stranger-mid p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-stranger-accent/20">
            <svg
              className="h-7 w-7 text-stranger-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-stranger-light">
            아직 매칭이 없어요
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            위 버튼을 눌러 나와 맞는 상대를 찾아보세요
          </p>
        </div>
      )}
    </div>
  );
}
