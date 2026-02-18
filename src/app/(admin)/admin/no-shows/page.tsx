import { getNoShows } from "@/actions/admin";

export default async function AdminNoShowsPage() {
  const { noShows } = await getNoShows();

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-stranger-light">
        노쇼 현황
      </h1>

      {noShows.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          노쇼 기록이 없습니다
        </p>
      ) : (
        <div className="space-y-2">
          {noShows.map((ns) => (
            <div
              key={ns.id}
              className="flex items-center justify-between rounded-xl bg-stranger-mid p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stranger-light">
                    {ns.nickname}
                  </span>
                  <span className="rounded-md bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                    노쇼
                  </span>
                  {ns.user_status === "banned" && (
                    <span className="rounded-md bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                      차단됨
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  미션 #{ns.mission_id} · 누적 {ns.total_no_shows}회
                </p>
                <p className="text-xs text-gray-500">
                  데드라인:{" "}
                  {new Date(ns.check_deadline).toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
