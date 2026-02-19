import { redirect } from "next/navigation";
import { getMission } from "@/actions/mission";
import MissionCard from "@/components/mission/MissionCard";
import { ROUTES } from "@/lib/constants/routes";

interface MissionPageProps {
  params: { id: string };
}

export default async function MissionPage({ params }: MissionPageProps) {
  const missionId = parseInt(params.id, 10);

  if (isNaN(missionId)) {
    redirect(ROUTES.HOME);
  }

  const result = await getMission(missionId);

  if (result.error || !result.mission) {
    redirect(ROUTES.HOME);
  }

  return (
    <div className="px-4 py-6">
      <h2 className="mb-4 text-xl font-bold text-stranger-light">
        미션 상세
      </h2>
      <MissionCard mission={result.mission} role={result.role} partnerNickname={result.partnerNickname} partnerId={result.partnerId} />
    </div>
  );
}
