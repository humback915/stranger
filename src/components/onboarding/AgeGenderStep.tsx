"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/motion/PageTransition";

export default function AgeGenderStep() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("onboarding");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.nickname) setNickname(data.nickname);
      if (data.birth_year) setBirthYear(String(data.birth_year));
      if (data.gender) setGender(data.gender);
    }
  }, []);

  const handleNext = () => {
    if (nickname.length < 2 || nickname.length > 10) {
      setError(t("errors.nickname_length"));
      return;
    }

    const year = parseInt(birthYear);
    const currentYear = new Date().getFullYear();

    if (!year || year < 1924 || year > currentYear - 19) {
      setError(t("errors.age_min"));
      return;
    }
    if (!gender) {
      setError(t("errors.gender_required"));
      return;
    }

    const existing = JSON.parse(sessionStorage.getItem("onboarding") || "{}");
    sessionStorage.setItem(
      "onboarding",
      JSON.stringify({ ...existing, nickname, birth_year: year, gender })
    );
    router.push(ROUTES.ONBOARDING.PHOTOS);
  };

  return (
    <PageTransition>
      <h2 className="mb-8 text-2xl font-bold text-stranger-light">
        {t("basic_info")}
      </h2>

      <div className="flex flex-col gap-6">
        <div>
          <label className="mb-2 block text-sm text-gray-400">{t("nickname")}</label>
          <input
            type="text"
            placeholder={t("nickname_placeholder")}
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setError("");
            }}
            maxLength={10}
            className="w-full rounded-lg bg-stranger-mid px-4 py-3 text-stranger-light placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-stranger-accent"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">{t("birth_year")}</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder={t("birth_year_placeholder")}
            value={birthYear}
            onChange={(e) => {
              setBirthYear(e.target.value);
              setError("");
            }}
            className="w-full rounded-lg bg-stranger-mid px-4 py-3 text-stranger-light placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-stranger-accent"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">{t("gender")}</label>
          <div className="flex gap-3">
            {(
              [
                { value: "male", label: t("gender_male") },
                { value: "female", label: t("gender_female") },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setGender(option.value);
                  setError("");
                }}
                className={`flex-1 rounded-lg py-3 text-center transition-all ${
                  gender === option.value
                    ? "bg-stranger-accent text-white"
                    : "bg-stranger-mid text-gray-400 hover:text-stranger-light"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-stranger-accent">{error}</p>}

        <Button
          onClick={handleNext}
          disabled={!nickname || !birthYear || !gender}
          className="mt-4 w-full"
          size="lg"
        >
          {t("complete_start")}
        </Button>
      </div>
    </PageTransition>
  );
}
