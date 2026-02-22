import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/actions/profile";
import { ROUTES } from "@/lib/constants/routes";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const result = await getMyProfile();

  if (result.error || !result.profile) {
    redirect(ROUTES.LOGIN);
  }

  return <SettingsClient profile={result.profile!} />;
}
