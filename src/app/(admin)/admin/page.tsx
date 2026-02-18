import { getAdminStats } from "@/actions/admin";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "총 사용자", value: stats.totalUsers, color: "text-blue-400" },
    { label: "총 매칭", value: stats.totalMatches, color: "text-green-400" },
    { label: "총 미션", value: stats.totalMissions, color: "text-purple-400" },
    {
      label: "대기 중 신고",
      value: stats.pendingReports,
      color: "text-red-400",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-stranger-light">
        관리자 대시보드
      </h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-stranger-mid p-5 text-center"
          >
            <p className="text-xs text-gray-400">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
