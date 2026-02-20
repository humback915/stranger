"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { confirmDeparture } from "@/actions/mission";
import { useMissionCountdown } from "@/hooks/useMissionCountdown";

interface DepartureConfirmationProps {
  missionId: number;
  meetingDate: string;
  meetingTime: string;
  isConfirmed: boolean;
  partnerConfirmed: boolean;
}

export default function DepartureConfirmation({
  missionId,
  meetingDate,
  meetingTime,
  isConfirmed,
  partnerConfirmed,
}: DepartureConfirmationProps) {
  const t = useTranslations("mission");
  const { timeLeft, canConfirm, isPast } = useMissionCountdown(
    meetingDate,
    meetingTime
  );
  const [confirmed, setConfirmed] = useState(isConfirmed);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await confirmDeparture(missionId);
      if (result.error) {
        setError(result.error);
      } else {
        setConfirmed(true);
      }
    });
  };

  return (
    <div className="rounded-xl bg-stranger-mid p-4">
      <h4 className="mb-3 text-sm font-semibold text-stranger-light">
        {t("departure_title")}
      </h4>

      {/* 카운트다운 */}
      <div className="mb-3 text-center">
        <p className="text-xs text-gray-400">{t("departure_title")}</p>
        <p className="text-lg font-bold text-stranger-accent">{timeLeft}</p>
      </div>

      {/* 출발 상태 */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-stranger-dark px-3 py-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              confirmed ? "bg-green-500" : "bg-gray-500"
            }`}
          />
          <span className="text-xs text-gray-300">
            {confirmed ? t("departure_confirmed") : t("partner_not_confirmed")}
          </span>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-stranger-dark px-3 py-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              partnerConfirmed ? "bg-green-500" : "bg-gray-500"
            }`}
          />
          <span className="text-xs text-gray-300">
            {partnerConfirmed ? t("partner_confirmed") : t("partner_not_confirmed")}
          </span>
        </div>
      </div>

      {/* 확인 버튼 */}
      {!confirmed && !isPast && (
        <>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isPending}
            className="w-full rounded-lg bg-stranger-accent py-3 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          >
            {isPending
              ? "..."
              : canConfirm
                ? t("departure_confirm_btn")
                : t("departure_available")}
          </button>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </>
      )}

      {confirmed && (
        <div className="rounded-lg bg-green-600/10 py-3 text-center text-sm font-medium text-green-400">
          {t("departure_confirmed")}
        </div>
      )}
    </div>
  );
}
