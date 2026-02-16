"use client";

import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { respondToMatch } from "@/actions/matching";
import { ROUTES } from "@/lib/constants/routes";

const GENDER_LABELS: Record<string, string> = {
  male: "남성",
  female: "여성",
  any: "무관",
};

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

interface MatchCardProps {
  match: {
    id: number;
    similarity_score: number;
    compatibility_score: number;
    distance_km: number | null;
    user_a_accepted: boolean | null;
    user_b_accepted: boolean | null;
    status: string;
    created_at: string;
    role: "user_a" | "user_b";
    partner: Partner | null;
    missionId?: number | null;
  };
  onStatusChange?: (
    matchId: number,
    newStatus: string,
    myAccepted: boolean | null,
    missionId?: number | null
  ) => void;
}

export default function MatchCard({ match, onStatusChange }: MatchCardProps) {
  const [status, setStatus] = useState(match.status);
  const [myAccepted, setMyAccepted] = useState<boolean | null>(
    match.role === "user_a" ? match.user_a_accepted : match.user_b_accepted
  );
  const [partnerAccepted] = useState<boolean | null>(
    match.role === "user_a" ? match.user_b_accepted : match.user_a_accepted
  );
  const [missionId, setMissionId] = useState<number | null>(
    match.missionId ?? null
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const partner = match.partner;
  const currentYear = new Date().getFullYear();
  const partnerAge = partner ? currentYear - partner.birth_year : null;

  const handleRespond = (accept: boolean) => {
    startTransition(async () => {
      const result = await respondToMatch(match.id, accept);
      if (result.error) {
        setError(result.error);
      } else if (result.status) {
        setStatus(result.status);
        setMyAccepted(result.myAccepted ?? null);
        if (result.missionId) setMissionId(result.missionId);
        onStatusChange?.(
          match.id,
          result.status,
          result.myAccepted ?? null,
          result.missionId
        );
      }
    });
  };

  // 표시할 상태 결정
  const getDisplayStatus = () => {
    if (status === "rejected") return { label: "거절됨", color: "bg-red-500/20 text-red-400" };
    if (status === "accepted") return { label: "매칭 성사!", color: "bg-green-500/20 text-green-400" };
    if (status === "completed") return { label: "완료", color: "bg-blue-500/20 text-blue-400" };
    if (status === "expired") return { label: "만료됨", color: "bg-gray-500/20 text-gray-400" };
    // pending
    if (myAccepted === true) return { label: "상대 응답 대기", color: "bg-yellow-500/20 text-yellow-400" };
    return { label: "응답 대기", color: "bg-yellow-500/20 text-yellow-400" };
  };

  const { label: statusLabel, color: statusColor } = getDisplayStatus();

  // 아직 내가 응답하지 않은 pending 상태
  const canRespond = status === "pending" && myAccepted === null;

  return (
    <div className="rounded-2xl bg-stranger-mid p-5">
      {/* 상태 배지 + 호환성 */}
      <div className="mb-3 flex items-center justify-between">
        <span className={`rounded-md px-2 py-0.5 text-xs ${statusColor}`}>
          {statusLabel}
        </span>
        <span className="text-sm font-bold text-stranger-accent">
          {Math.round(match.compatibility_score * 100)}% 호환
        </span>
      </div>

      {/* 상대 프로필 사진 */}
      {partner?.photo_urls && partner.photo_urls.length > 0 && (
        <PhotoCarousel photos={partner.photo_urls} />
      )}

      {/* 상대 정보 */}
      {partner ? (
        <div className="mb-3 space-y-2">
          <div className="flex items-center gap-3">
            {(!partner.photo_urls || partner.photo_urls.length === 0) && (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stranger-dark text-lg">
                {partner.gender === "male" ? "👨" : "👩"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-stranger-light">
                  {GENDER_LABELS[partner.gender]} · {partnerAge}세
                </p>
                {partner.mbti && (
                  <span className="rounded bg-stranger-accent/20 px-1.5 py-0.5 text-[10px] text-stranger-accent">
                    {partner.mbti}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {partner.occupation} · {partner.activity_area}
              </p>
              {(status === "accepted" || status === "completed") && partner.nickname && (
                <p className="text-xs font-medium text-stranger-accent">
                  {partner.nickname}
                </p>
              )}
            </div>
          </div>
          {/* 취미/성격/이상형 태그 */}
          {(partner.hobbies?.length || partner.personality?.length || partner.ideal_type?.length) ? (
            <div className="flex flex-wrap gap-1.5 pl-[60px]">
              {partner.hobbies?.map((h) => (
                <span key={h} className="rounded-md bg-stranger-accent/15 px-2 py-0.5 text-[10px] text-stranger-accent">
                  {h}
                </span>
              ))}
              {partner.personality?.map((p) => (
                <span key={p} className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] text-purple-400">
                  {p}
                </span>
              ))}
              {partner.ideal_type?.map((t) => (
                <span key={t} className="rounded-md bg-pink-500/15 px-2 py-0.5 text-[10px] text-pink-400">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
          {/* 매칭 선호 태그 */}
          {partner.preferred_gender && (
            <div className="flex flex-wrap gap-1.5 pl-[60px]">
              <span className="rounded-md bg-stranger-dark px-2 py-0.5 text-[10px] text-gray-400">
                선호: {GENDER_LABELS[partner.preferred_gender]}
              </span>
              {partner.preferred_age_min != null && (
                <span className="rounded-md bg-stranger-dark px-2 py-0.5 text-[10px] text-gray-400">
                  {partner.preferred_age_min}~{partner.preferred_age_max}세
                </span>
              )}
              {partner.preferred_distance_km != null && (
                <span className="rounded-md bg-stranger-dark px-2 py-0.5 text-[10px] text-gray-400">
                  {partner.preferred_distance_km}km 이내
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="mb-3 text-sm text-gray-400">
          상대 정보를 불러올 수 없습니다
        </p>
      )}

      {/* 점수 상세 */}
      <div className="mb-4 flex gap-2">
        <div className="flex-1 rounded-lg bg-stranger-dark px-3 py-2 text-center">
          <p className="text-xs text-gray-400">유사도</p>
          <p className="text-sm font-bold text-stranger-light">
            {Math.round(match.similarity_score * 100)}%
          </p>
        </div>
        <div className="flex-1 rounded-lg bg-stranger-dark px-3 py-2 text-center">
          <p className="text-xs text-gray-400">거리</p>
          <p className="text-sm font-bold text-stranger-light">
            {match.distance_km != null ? `${match.distance_km}km` : "-"}
          </p>
        </div>
      </div>

      {/* 양쪽 수락 상태 표시 (pending 중) */}
      {status === "pending" && myAccepted === true && (
        <div className="mb-4 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-stranger-dark px-3 py-2">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-xs text-gray-300">내가 수락함</span>
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-stranger-dark px-3 py-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                partnerAccepted === true
                  ? "bg-green-500"
                  : partnerAccepted === false
                    ? "bg-red-500"
                    : "animate-pulse bg-yellow-500"
              }`}
            />
            <span className="text-xs text-gray-300">
              {partnerAccepted === true
                ? "상대 수락"
                : partnerAccepted === false
                  ? "상대 거절"
                  : "상대 응답 대기"}
            </span>
          </div>
        </div>
      )}

      {/* 수락/거절 버튼 */}
      {canRespond && (
        <div className="flex gap-2">
          <button
            onClick={() => handleRespond(false)}
            disabled={isPending}
            className="flex-1 rounded-lg border border-gray-600 py-2.5 text-sm text-gray-400 transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-50"
          >
            거절
          </button>
          <button
            onClick={() => handleRespond(true)}
            disabled={isPending}
            className="flex-1 rounded-lg bg-stranger-accent py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? "처리 중..." : "수락"}
          </button>
        </div>
      )}

      {/* 매칭 성사 → 미션 링크 */}
      {status === "accepted" && missionId && (
        <Link
          href={ROUTES.MISSION_DETAIL(missionId)}
          className="block rounded-lg bg-stranger-accent py-3 text-center text-sm font-medium text-white"
        >
          미션 확인하기
        </Link>
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function PhotoCarousel({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState(0);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  if (photos.length === 0) return null;

  return (
    <div className="relative mb-3 overflow-hidden rounded-xl">
      <div className="aspect-[4/3] w-full">
        <img
          src={photos[current]}
          alt={`프로필 사진 ${current + 1}`}
          className="h-full w-full object-cover"
        />
      </div>

      {photos.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {photos.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === current
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
