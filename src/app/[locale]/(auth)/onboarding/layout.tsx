"use client";

import { usePathname } from "@/i18n/navigation";
import { type ReactNode } from "react";
import { ROUTES } from "@/lib/constants/routes";

const steps = [
  { path: ROUTES.ONBOARDING.ROOT, label: "기본 정보" },
  { path: ROUTES.ONBOARDING.PHOTOS, label: "프로필 사진" },
  { path: ROUTES.ONBOARDING.OCCUPATION, label: "직업" },
  { path: ROUTES.ONBOARDING.MBTI, label: "MBTI" },
  { path: ROUTES.ONBOARDING.HOBBIES, label: "취미" },
  { path: ROUTES.ONBOARDING.PERSONALITY, label: "성격" },
  { path: ROUTES.ONBOARDING.IDEAL_TYPE, label: "이상형" },
  { path: ROUTES.ONBOARDING.AREA, label: "활동 지역" },
  { path: ROUTES.ONBOARDING.PREFERENCES, label: "선호 설정" },
];

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const currentStepIndex = steps.findIndex((s) => s.path === pathname);
  const progress =
    currentStepIndex >= 0
      ? ((currentStepIndex + 1) / steps.length) * 100
      : 100;

  const isComplete = pathname === ROUTES.ONBOARDING.COMPLETE;

  return (
    <div className="flex min-h-screen flex-col bg-stranger-dark">
      {!isComplete && (
        <div className="sticky top-0 z-10 bg-stranger-dark px-6 pb-2 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">
              {currentStepIndex >= 0
                ? `${currentStepIndex + 1} / ${steps.length}`
                : ""}
            </span>
            <span className="text-xs text-gray-400">
              {currentStepIndex >= 0 ? steps[currentStepIndex].label : ""}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-stranger-mid">
            <div
              className="h-1 rounded-full bg-stranger-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col px-6 py-8">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
