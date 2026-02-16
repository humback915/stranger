"use client";

import { useEffect, useState } from "react";

interface MissionCountdownResult {
  /** 만남 시간까지 남은 시간 문자열 (예: "2시간 30분") */
  timeLeft: string;
  /** 출발 확인 가능 여부 (만남 1시간 전부터 true) */
  canConfirm: boolean;
  /** 만남 시간이 지났는지 */
  isPast: boolean;
  /** 만남까지 남은 밀리초 */
  remainingMs: number;
}

export function useMissionCountdown(
  meetingDate: string,
  meetingTime: string
): MissionCountdownResult {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const meetingDateTime = new Date(`${meetingDate}T${meetingTime}`);
  const remainingMs = meetingDateTime.getTime() - now.getTime();
  const isPast = remainingMs <= 0;
  const canConfirm = remainingMs <= 60 * 60 * 1000; // 1시간 이내

  let timeLeft: string;
  if (isPast) {
    timeLeft = "만남 시간이 지났습니다";
  } else {
    const totalMinutes = Math.floor(remainingMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      timeLeft = `${days}일 ${hours % 24}시간`;
    } else if (hours > 0) {
      timeLeft = `${hours}시간 ${minutes}분`;
    } else {
      timeLeft = `${minutes}분`;
    }
  }

  return { timeLeft, canConfirm, isPast, remainingMs };
}
