"use client";

import { useState, useTransition } from "react";
import { updateReportStatus, getReports } from "@/actions/admin";

type Report = {
  id: number;
  reporter_id: string;
  reported_user_id: string;
  mission_id: number | null;
  report_type: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter_nickname: string;
  reported_nickname: string;
};

const STATUS_OPTIONS = ["pending", "reviewing", "resolved", "dismissed"] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  reviewing: "검토 중",
  resolved: "해결",
  dismissed: "기각",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  reviewing: "bg-blue-500/20 text-blue-400",
  resolved: "bg-green-500/20 text-green-400",
  dismissed: "bg-gray-500/20 text-gray-400",
};
const REPORT_TYPE_LABELS: Record<string, string> = {
  harassment: "괴롭힘",
  inappropriate: "부적절",
  no_show: "노쇼",
  safety: "안전",
  other: "기타",
};

export default function ReportsClient({
  initialReports,
}: {
  initialReports: Report[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [filter, setFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    startTransition(async () => {
      const result = await getReports(newFilter);
      if (!result.error) {
        setReports(result.reports as Report[]);
      }
    });
  };

  const handleStatusChange = (reportId: number, newStatus: string) => {
    startTransition(async () => {
      const result = await updateReportStatus(
        reportId,
        newStatus as "pending" | "reviewing" | "resolved" | "dismissed"
      );
      if (result.success) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, status: newStatus } : r
          )
        );
      }
    });
  };

  return (
    <div>
      {/* 필터 */}
      <div className="mb-4 flex gap-2">
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
              filter === s
                ? "bg-stranger-accent text-white"
                : "bg-stranger-mid text-gray-400 hover:text-stranger-light"
            }`}
          >
            {s === "all" ? "전체" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {isPending && (
        <p className="mb-2 text-xs text-gray-400">로딩 중...</p>
      )}

      {/* 신고 목록 */}
      <div className="space-y-3">
        {reports.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            신고가 없습니다
          </p>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl bg-stranger-mid p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs ${
                      STATUS_COLORS[report.status] ?? ""
                    }`}
                  >
                    {STATUS_LABELS[report.status] ?? report.status}
                  </span>
                  <span className="rounded-md bg-stranger-dark px-2 py-0.5 text-xs text-gray-400">
                    {REPORT_TYPE_LABELS[report.report_type] ??
                      report.report_type}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(report.created_at).toLocaleDateString("ko-KR")}
                </span>
              </div>

              <div className="text-xs text-gray-400">
                <span className="text-stranger-light">
                  {report.reporter_nickname}
                </span>
                {" → "}
                <span className="text-red-400">
                  {report.reported_nickname}
                </span>
              </div>

              {report.description && (
                <p className="text-sm text-gray-300">{report.description}</p>
              )}

              {/* 상태 변경 */}
              <div className="flex gap-1.5 pt-1">
                {STATUS_OPTIONS.filter((s) => s !== report.status).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(report.id, s)}
                    disabled={isPending}
                    className="rounded-md bg-stranger-dark px-2 py-1 text-xs text-gray-400 transition-colors hover:text-stranger-light disabled:opacity-50"
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
