"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitSafetyReport } from "@/actions/safety";

type ReportType = "harassment" | "inappropriate" | "no_show" | "safety" | "other";

interface ReportModalProps {
  reportedUserId: string;
  missionId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({
  reportedUserId,
  missionId,
  isOpen,
  onClose,
}: ReportModalProps) {
  const t = useTranslations("safety");
  const reportTypes: ReportType[] = ["harassment", "inappropriate", "no_show", "safety", "other"];
  const [reportType, setReportType] = useState<ReportType>("other");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setReportType("other");
    setDescription("");
    setSubmitted(false);
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    setError("");
    startTransition(async () => {
      const result = await submitSafetyReport({
        reported_user_id: reportedUserId,
        mission_id: missionId,
        report_type: reportType,
        description: description.trim() || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
        setTimeout(handleClose, 1500);
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-md rounded-t-2xl bg-stranger-mid p-6 pb-8">
        {/* 헤더 */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stranger-light">{t("report_title")}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-stranger-light">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-green-400">{t("report_success")}</p>
          </div>
        ) : (
          <>
            {/* 신고 유형 선택 */}
            <div className="mb-4">
              <p className="mb-2 text-xs text-gray-400">{t("report_type_label")}</p>
              <div className="space-y-2">
                {reportTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setReportType(type)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                      reportType === type
                        ? "bg-red-500/15 text-red-400"
                        : "bg-stranger-dark text-gray-300"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full border-2 transition-colors ${
                        reportType === type
                          ? "border-red-400 bg-red-400"
                          : "border-gray-500"
                      }`}
                    />
                    {t(`report_types.${type}` as Parameters<typeof t>[0])}
                  </button>
                ))}
              </div>
            </div>

            {/* 상세 내용 */}
            <div className="mb-5">
              <p className="mb-1.5 text-xs text-gray-400">{t("report_desc_label")}</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder={t("report_desc_placeholder")}
                className="w-full resize-none rounded-xl bg-stranger-dark px-4 py-3 text-sm text-stranger-light placeholder-gray-500 outline-none focus:ring-1 focus:ring-red-500"
              />
              <p className="mt-1 text-right text-[10px] text-gray-600">
                {description.length}/500
              </p>
            </div>

            {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full rounded-xl bg-red-600 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {isPending ? t("report_submitting") : t("report_submit")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
