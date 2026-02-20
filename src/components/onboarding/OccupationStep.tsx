"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/motion/PageTransition";

const OCCUPATIONS = [
  "학생", "직장인", "프리랜서", "자영업", "공무원",
  "의료/보건", "IT/개발", "디자인/예술", "교육", "금융",
  "법률", "연구/학술", "서비스업", "기타",
];

export default function OccupationStep() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const tCommon = useTranslations("common");
  const [selected, setSelected] = useState("");
  const [custom, setCustom] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("onboarding") || "{}");
    if (saved.occupation) {
      if (OCCUPATIONS.includes(saved.occupation)) {
        setSelected(saved.occupation);
      } else {
        setShowCustom(true);
        setCustom(saved.occupation);
      }
    }
  }, []);

  const handleSelect = (occupation: string) => {
    if (occupation === "기타") {
      setShowCustom(true);
      setSelected("");
    } else {
      setSelected(occupation);
      setShowCustom(false);
      setCustom("");
    }
  };

  const handleNext = () => {
    const occupation = showCustom ? custom.trim() : selected;
    if (!occupation) return;

    const existing = JSON.parse(sessionStorage.getItem("onboarding") || "{}");
    sessionStorage.setItem(
      "onboarding",
      JSON.stringify({ ...existing, occupation })
    );
    router.push(ROUTES.ONBOARDING.MBTI);
  };

  const isValid = showCustom ? custom.trim().length > 0 : selected.length > 0;

  return (
    <PageTransition>
      <h2 className="mb-8 text-2xl font-bold text-stranger-light">
        {t("occupation_title")}
      </h2>

      <div className="flex flex-wrap gap-2">
        {OCCUPATIONS.map((occ) => (
          <button
            key={occ}
            type="button"
            onClick={() => handleSelect(occ)}
            className={`rounded-full px-4 py-2 text-sm transition-all ${
              (occ === "기타" && showCustom) || selected === occ
                ? "bg-stranger-accent text-white"
                : "bg-stranger-mid text-gray-400 hover:text-stranger-light"
            }`}
          >
            {occ}
          </button>
        ))}
      </div>

      {showCustom && (
        <input
          type="text"
          placeholder={t("occupation_placeholder")}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          maxLength={50}
          className="mt-4 w-full rounded-lg bg-stranger-mid px-4 py-3 text-stranger-light placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-stranger-accent"
          autoFocus
        />
      )}

      <Button
        onClick={handleNext}
        disabled={!isValid}
        className="mt-8 w-full"
        size="lg"
      >
        {tCommon("next")}
      </Button>
    </PageTransition>
  );
}
