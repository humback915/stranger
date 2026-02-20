"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitSafetyReport } from "@/actions/safety";
import { REPORT_TYPES } from "@/lib/validations/safety";

type Step = "main" | "report_form" | "done";

export default function SafetyButton() {
  const t = useTranslations("safety");
  const tCommon = useTranslations("common");
  const [step, setStep] = useState<Step>("main");
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [reportedUserId, setReportedUserId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const reset = () => {
    setStep("main");
    setReportType("");
    setDescription("");
    setError("");
    setShowModal(false);
  };

  const handleSubmitReport = () => {
    if (!reportType) {
      setError(t("error_select_type"));
      return;
    }

    startTransition(async () => {
      let lat: number | undefined;
      let lng: number | undefined;

      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        // 위치 정보를 가져올 수 없어도 신고는 진행
      }

      const result = await submitSafetyReport({
        reported_user_id: reportedUserId || "00000000-0000-0000-0000-000000000000",
        report_type: reportType as (typeof REPORT_TYPES)[number],
        description: description || undefined,
        reporter_lat: lat,
        reporter_lng: lng,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setStep("done");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
        aria-label={t("emergency_title")}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-stranger-mid p-6">
            {step === "main" && (
              <>
                <h3 className="mb-2 text-lg font-bold text-stranger-light">
                  {t("emergency_title")}
                </h3>
                <p className="mb-6 text-sm text-gray-400">
                  {t("emergency_desc")}
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="tel:112"
                    className="block rounded-lg bg-red-600 py-3 text-center text-sm font-medium text-white"
                  >
                    {t("emergency_call")}
                  </a>
                  <button
                    onClick={() => setStep("report_form")}
                    className="rounded-lg bg-stranger-accent py-3 text-sm font-medium text-white"
                  >
                    {t("report_partner_btn")}
                  </button>
                  <button
                    onClick={reset}
                    className="rounded-lg py-3 text-sm text-gray-400"
                  >
                    {tCommon("close")}
                  </button>
                </div>
              </>
            )}

            {step === "report_form" && (
              <>
                <h3 className="mb-4 text-lg font-bold text-stranger-light">
                  {t("report_partner_title")}
                </h3>

                <div className="mb-4 flex flex-col gap-2">
                  {REPORT_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setReportType(type);
                        setError("");
                      }}
                      className={`rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                        reportType === type
                          ? "border-stranger-accent bg-stranger-accent/20 text-stranger-light"
                          : "border-gray-600 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      {t(`report_types.${type}` as Parameters<typeof t>[0])}
                    </button>
                  ))}
                </div>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("detail_optional_placeholder")}
                  maxLength={500}
                  className="mb-4 w-full rounded-lg border border-gray-600 bg-stranger-dark p-3 text-sm text-stranger-light placeholder:text-gray-500 focus:border-stranger-accent focus:outline-none"
                  rows={3}
                />

                <input
                  type="text"
                  value={reportedUserId}
                  onChange={(e) => setReportedUserId(e.target.value)}
                  className="mb-4 hidden"
                />

                {error && (
                  <p className="mb-3 text-sm text-red-400">{error}</p>
                )}

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSubmitReport}
                    disabled={isPending}
                    className="rounded-lg bg-red-600 py-3 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {isPending ? t("report_doing") : t("report_submit")}
                  </button>
                  <button
                    onClick={() => {
                      setStep("main");
                      setError("");
                    }}
                    className="rounded-lg py-3 text-sm text-gray-400"
                  >
                    {tCommon("back")}
                  </button>
                </div>
              </>
            )}

            {step === "done" && (
              <>
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600/20">
                    <svg
                      className="h-8 w-8 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-2 text-center text-lg font-bold text-stranger-light">
                  {t("done_title")}
                </h3>
                <p className="mb-6 text-center text-sm text-gray-400">
                  {t("done_desc")}
                </p>
                <button
                  onClick={reset}
                  className="w-full rounded-lg bg-stranger-accent py-3 text-sm font-medium text-white"
                >
                  {tCommon("confirm")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
