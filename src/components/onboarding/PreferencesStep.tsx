"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createProfile } from "@/actions/profile";
import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/motion/PageTransition";

export default function PreferencesStep() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const tGender = useTranslations("gender");
  const [preferredGender, setPreferredGender] = useState<
    "male" | "female" | "any"
  >("any");
  const [ageMin, setAgeMin] = useState(22);
  const [ageMax, setAgeMax] = useState(35);
  const [distance, setDistance] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("onboarding") || "{}");
    if (saved.preferred_gender) setPreferredGender(saved.preferred_gender);
    if (saved.preferred_age_min) setAgeMin(saved.preferred_age_min);
    if (saved.preferred_age_max) setAgeMax(saved.preferred_age_max);
    if (saved.preferred_distance_km) setDistance(saved.preferred_distance_km);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const saved = JSON.parse(sessionStorage.getItem("onboarding") || "{}");

    const profileData = {
      nickname: saved.nickname || "",
      birth_year: saved.birth_year,
      gender: saved.gender,
      occupation: saved.occupation,
      mbti: saved.mbti || null,
      hobbies: saved.hobbies || [],
      personality: saved.personality || [],
      ideal_type: saved.ideal_type || [],
      photo_urls: saved.photo_urls || [],
      activity_area: saved.activity_area,
      activity_lat: saved.activity_lat,
      activity_lng: saved.activity_lng,
      preferred_gender: preferredGender,
      preferred_age_min: ageMin,
      preferred_age_max: ageMax,
      preferred_distance_km: distance,
    };

    const result = await createProfile(profileData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    sessionStorage.removeItem("onboarding");
    router.push(ROUTES.ONBOARDING.COMPLETE);
  };

  return (
    <PageTransition>
      <h2 className="mb-8 text-2xl font-bold text-stranger-light">
        {t("preferences_question")}
      </h2>

      <div className="flex flex-col gap-6">
        {/* 선호 성별 */}
        <div>
          <label className="mb-2 block text-sm text-gray-400">{t("preferred_gender")}</label>
          <div className="flex gap-2">
            {(
              [
                { value: "male" as const, label: tGender("male") },
                { value: "female" as const, label: tGender("female") },
                { value: "any" as const, label: tGender("any") },
              ]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPreferredGender(option.value)}
                className={`flex-1 rounded-lg py-2.5 text-sm transition-all ${
                  preferredGender === option.value
                    ? "bg-stranger-accent text-white"
                    : "bg-stranger-mid text-gray-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 선호 나이 */}
        <div>
          <label className="mb-2 block text-sm text-gray-400">
            {t("preferred_age", { min: ageMin, max: ageMax })}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={19}
              max={ageMax}
              value={ageMin}
              onChange={(e) => setAgeMin(Number(e.target.value))}
              className="flex-1 accent-stranger-accent"
            />
            <span className="text-sm text-gray-400">~</span>
            <input
              type="range"
              min={ageMin}
              max={60}
              value={ageMax}
              onChange={(e) => setAgeMax(Number(e.target.value))}
              className="flex-1 accent-stranger-accent"
            />
          </div>
        </div>

        {/* 선호 거리 */}
        <div>
          <label className="mb-2 block text-sm text-gray-400">
            {t("preferred_distance", { km: distance })}
          </label>
          <input
            type="range"
            min={1}
            max={50}
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full accent-stranger-accent"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>1km</span>
            <span>50km</span>
          </div>
        </div>

        {error && <p className="text-sm text-stranger-accent">{error}</p>}

        <Button
          onClick={handleSubmit}
          loading={loading}
          className="mt-4 w-full"
          size="lg"
        >
          {t("complete_profile_btn")}
        </Button>
      </div>
    </PageTransition>
  );
}
