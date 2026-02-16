"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IDEAL_TYPES } from "@/lib/constants/ideal-type";
import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/motion/PageTransition";

const MAX_SELECT = 5;

export default function IdealTypeStep() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("onboarding") || "{}");
    if (saved.ideal_type) setSelected(saved.ideal_type);
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
      JSON.stringify({ ...existing, ideal_type: skip ? [] : selected })
    );
    router.push(ROUTES.ONBOARDING.AREA);
  };

  return (
    <PageTransition>
      <h2 className="mb-2 text-2xl font-bold text-stranger-light">
        이상형은 어떤 사람인가요?
      </h2>
      <p className="mb-6 text-sm text-gray-400">
        최대 {MAX_SELECT}개까지 선택할 수 있어요 ({selected.length}/{MAX_SELECT})
      </p>

      <div className="flex flex-wrap gap-2">
        {IDEAL_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            className={`rounded-full px-3.5 py-2 text-sm transition-all ${
              selected.includes(type)
                ? "bg-pink-500 text-white"
                : "bg-stranger-mid text-gray-400 hover:text-stranger-light"
            }`}
          >
            {type}
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
          다음
        </Button>
        <button
          type="button"
          onClick={() => handleNext(true)}
          className="text-sm text-gray-400 hover:text-stranger-light transition-colors"
        >
          건너뛰기
        </button>
      </div>
    </PageTransition>
  );
}
