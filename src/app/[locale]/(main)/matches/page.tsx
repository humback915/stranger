import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getMyMatches } from "@/actions/matching";
import { ROUTES } from "@/lib/constants/routes";
import MatchesClient from "./MatchesClient";

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const result = await getMyMatches();

  if (result.error) {
    redirect(ROUTES.LOGIN);
  }

  return <MatchesClient initialMatches={result.matches ?? []} />;
}
