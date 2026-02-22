import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMyMatches } from "@/actions/matching";
import { ROUTES } from "@/lib/constants/routes";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const gt = await getTranslations("gender");
  const result = await getMyMatches();
  const matches = result.matches ?? [];

  const pendingMatches = matches.filter((m) => m.status === "pending");
  const activeMatches = matches.filter((m) =>
    ["accepted", "completed"].includes(m.status)
  );

  const currentYear = new Date().getFullYear();

  return (
    <div className="px-6 py-8">
      <p className="text-gray-400">
        {t("subtitle")}
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <div className="rounded-2xl bg-stranger-mid p-6">
          <h3 className="font-medium text-stranger-light">
            {t("questions_card_title")}
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {t("questions_card_desc")}
          </p>
          <Link
            href={ROUTES.QUESTIONS}
            className="mt-4 inline-block rounded-xl bg-stranger-accent px-4 py-2 text-sm font-medium text-white"
          >
            {t("questions_card_btn")}
          </Link>
        </div>

        <div className="rounded-2xl bg-stranger-mid p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-stranger-light">{t("matches_title")}</h3>
            <Link
              href={ROUTES.MATCHES}
              className="text-xs text-stranger-accent"
            >
              {t("matches_view_all")}
            </Link>
          </div>

          {matches.length === 0 ? (
            <p className="mt-2 text-sm text-gray-400">
              {t("no_matches")}
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {/* 활성 매칭 */}
              {activeMatches.map((match) => {
                const p = match.partner;
                const age = p ? currentYear - p.birth_year : null;
                return (
                  <Link
                    key={match.id}
                    href={
                      match.missionId
                        ? ROUTES.MISSION_DETAIL(match.missionId)
                        : ROUTES.MATCHES
                    }
                    className="block rounded-xl bg-stranger-dark p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-sm">
                        {p?.gender === "male" ? "👨" : "👩"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-stranger-light">
                            {p ? `${gt(p.gender as "male" | "female" | "any")} · ${age}` : t("no_info")}
                          </span>
                          {p?.mbti && (
                            <span className="rounded bg-stranger-accent/20 px-1.5 py-0.5 text-[10px] text-stranger-accent">
                              {p.mbti}
                            </span>
                          )}
                          <span className="rounded-md bg-green-500/20 px-1.5 py-0.5 text-[10px] text-green-400">
                            {t("match_accepted")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {p?.occupation} · {p?.activity_area}
                        </p>
                      </div>
                      <svg
                        className="h-4 w-4 shrink-0 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-[52px]">
                      <span className="rounded-md bg-stranger-mid px-2 py-0.5 text-[10px] text-stranger-accent">
                        {t("compatibility", { score: Math.round(match.compatibility_score * 100) })}
                      </span>
                      {match.missionId && (
                        <span className="rounded-md bg-stranger-mid px-2 py-0.5 text-[10px] text-blue-400">
                          {t("mission_in_progress")}
                        </span>
                      )}
                      {p?.hobbies?.slice(0, 3).map((h: string) => (
                        <span key={h} className="rounded-md bg-stranger-accent/15 px-2 py-0.5 text-[10px] text-stranger-accent">
                          {h}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}

              {/* 대기 중인 매칭 */}
              {pendingMatches.map((match) => {
                const p = match.partner;
                const age = p ? currentYear - p.birth_year : null;
                const myAccepted =
                  match.role === "user_a"
                    ? match.user_a_accepted
                    : match.user_b_accepted;

                return (
                  <Link
                    key={match.id}
                    href={ROUTES.MATCHES}
                    className="block rounded-xl bg-stranger-dark p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 text-sm">
                        {p?.gender === "male" ? "👨" : "👩"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-stranger-light">
                            {p ? `${gt(p.gender as "male" | "female" | "any")} · ${age}` : t("no_info")}
                          </span>
                          {p?.mbti && (
                            <span className="rounded bg-stranger-accent/20 px-1.5 py-0.5 text-[10px] text-stranger-accent">
                              {p.mbti}
                            </span>
                          )}
                          <span className="rounded-md bg-yellow-500/20 px-1.5 py-0.5 text-[10px] text-yellow-400">
                            {myAccepted === true ? t("waiting_partner") : t("waiting")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {p?.activity_area}
                        </p>
                      </div>
                      <svg
                        className="h-4 w-4 shrink-0 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-[52px]">
                      <span className="rounded-md bg-stranger-mid px-2 py-0.5 text-[10px] text-stranger-accent">
                        {t("compatibility", { score: Math.round(match.compatibility_score * 100) })}
                      </span>
                      {p?.preferred_gender && (
                        <span className="rounded-md bg-stranger-mid px-2 py-0.5 text-[10px] text-gray-400">
                          {gt(p.preferred_gender as "male" | "female" | "any")}
                        </span>
                      )}
                      {p?.preferred_age_min != null && (
                        <span className="rounded-md bg-stranger-mid px-2 py-0.5 text-[10px] text-gray-400">
                          {p.preferred_age_min}~{p.preferred_age_max}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
