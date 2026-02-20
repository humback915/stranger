"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { MBTI_TYPES, MBTI_LABELS, type MbtiType } from "@/lib/constants/mbti";
import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/motion/PageTransition";

export default function MbtiStep() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const tCommon = useTranslations("common");
  const [selected, setSelected] = useState<MbtiType | null>(null);

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("onboarding") || "{}");
    if (saved.mbti) setSelected(saved.mbti);
  }, []);

  const handleNext = (skip: boolean = false) => {
    const existing = JSON.parse(sessionStorage.getItem("onboarding") || "{}");
    sessionStorage.setItem(
      "onboarding",
      JSON.stringify({ ...existing, mbti: skip ? null : selected })
    );
    router.push(ROUTES.ONBOARDING.HOBBIES);
  };

  return (
    <PageTransition>
      <h2 className="mb-2 text-2xl font-bold text-stranger-light">
        {t("mbti_title")}
      </h2>
      <p className="mb-6 text-sm text-gray-400">
        {t("mbti_skip_hint")}
      </p>

      <div className="grid grid-cols-4 gap-2">
        {MBTI_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelected(type)}
            className={`flex flex-col items-center rounded-lg p-2 transition-all ${
              selected === type
                ? "bg-stranger-accent text-white"
                : "bg-stranger-mid text-gray-400 hover:text-stranger-light"
            }`}
          >
            <span className="text-sm font-bold">{type}</span>
            <span className="mt-0.5 text-[10px] leading-tight opacity-70">
              {MBTI_LABELS[type].split(" ").pop()}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button
          onClick={() => handleNext(false)}
          disabled={!selected}
          className="w-full"
          size="lg"
        >
          {tCommon("next")}
        </Button>
        <button
          type="button"
          onClick={() => handleNext(true)}
          className="text-sm text-gray-400 hover:text-stranger-light transition-colors"
        >
          {tCommon("skip")}
        </button>
      </div>
    </PageTransition>
  );
}
