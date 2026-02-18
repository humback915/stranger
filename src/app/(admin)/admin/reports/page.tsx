import { getReports } from "@/actions/admin";
import ReportsClient from "./ReportsClient";

export default async function AdminReportsPage() {
  const { reports } = await getReports();

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-stranger-light">
        신고 관리
      </h1>
      <ReportsClient initialReports={reports} />
    </div>
  );
}
