import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getMission } from "@/actions/mission";
import MissionCard from "@/components/mission/MissionCard";
import { ROUTES } from "@/lib/constants/routes";

interface MissionPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function MissionPage({ params }: MissionPageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("mission");

  const missionId = parseInt(id, 10);

  if (isNaN(missionId)) {
    redirect(`/${locale}${ROUTES.HOME}`);
  }

  const result = await getMission(missionId);

  if (result.error || !result.mission) {
    redirect(`/${locale}${ROUTES.HOME}`);
  }

  const mission = result.mission!;
  const role = result.role!;

  return (
    <div className="px-4 py-6">
      <h2 className="mb-4 text-xl font-bold text-stranger-light">
        {t("title")}
      </h2>
      <MissionCard
        mission={mission}
        role={role}
        partnerNickname={result.partnerNickname}
        partnerId={result.partnerId}
      />
    </div>
  );
}
