"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { PERSONALITIES } from "@/lib/constants/personality";
import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/motion/PageTransition";

const MAX_SELECT = 5;

export default function PersonalityStep() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const tCommon = useTranslations("common");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("onboarding") || "{}");
    if (saved.personality) setSelected(saved.personality);
  }, []);

  const toggle = (item: string) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((v) => v !== item)
        : prev.length < MAX_SELECT
          ? [...prev, item]
          : prev
    );
  };

  const handleNext = (skip: boolean = false) => {
    const existing = JSON.parse(sessionStorage.getItem("onboarding") || "{}");
    sessionStorage.setItem(
      "onboarding",
      JSON.stringify({ ...existing, personality: skip ? [] : selected })
    );
    router.push(ROUTES.ONBOARDING.IDEAL_TYPE);
  };

  return (
    <PageTransition>
      <h2 className="mb-2 text-2xl font-bold text-stranger-light">
        {t("personality_title")}
      </h2>
      <p className="mb-6 text-sm text-gray-400">
        {t("hobbies_max_hint", { max: MAX_SELECT, current: selected.length })}
      </p>

      <div className="flex flex-wrap gap-2">
        {PERSONALITIES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => toggle(p)}
            className={`rounded-full px-3.5 py-2 text-sm transition-all ${
              selected.includes(p)
                ? "bg-purple-500 text-white"
                : "bg-stranger-mid text-gray-400 hover:text-stranger-light"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button
          onClick={() => handleNext(false)}
          disabled={selected.length === 0}
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
