"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, type Area } from "@/lib/constants/areas";
import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/motion/PageTransition";

export default function ActivityAreaStep() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState(0);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("onboarding") || "{}");
    if (saved.activity_area) {
      for (let i = 0; i < REGIONS.length; i++) {
        const area = REGIONS[i].areas.find(
          (a) => a.name === saved.activity_area
        );
        if (area) {
          setSelectedRegion(i);
          setSelectedArea(area);
          break;
        }
      }
    }
  }, []);

  const handleNext = () => {
    if (!selectedArea) return;

    const existing = JSON.parse(sessionStorage.getItem("onboarding") || "{}");
    sessionStorage.setItem(
      "onboarding",
      JSON.stringify({
        ...existing,
        activity_area: selectedArea.name,
        activity_lat: selectedArea.lat,
        activity_lng: selectedArea.lng,
      })
    );
    router.push(ROUTES.ONBOARDING.PREFERENCES);
  };

  return (
    <PageTransition>
      <h2 className="mb-8 text-2xl font-bold text-stranger-light">
        주로 활동하는 지역은?
      </h2>

      {/* 시/도 탭 */}
      <div className="mb-4 flex gap-2">
        {REGIONS.map((region, idx) => (
          <button
            key={region.name}
            type="button"
            onClick={() => {
              setSelectedRegion(idx);
              setSelectedArea(null);
            }}
            className={`rounded-full px-4 py-1.5 text-sm transition-all ${
              selectedRegion === idx
                ? "bg-stranger-accent text-white"
                : "bg-stranger-mid text-gray-400"
            }`}
          >
            {region.name}
          </button>
        ))}
      </div>

      {/* 구/시 선택 */}
      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {REGIONS[selectedRegion].areas.map((area) => (
          <button
            key={area.name}
            type="button"
            onClick={() => setSelectedArea(area)}
            className={`rounded-lg px-3 py-2.5 text-sm transition-all ${
              selectedArea?.name === area.name
                ? "bg-stranger-accent text-white"
                : "bg-stranger-mid text-gray-400 hover:text-stranger-light"
            }`}
          >
            {area.name}
          </button>
        ))}
      </div>

      <Button
        onClick={handleNext}
        disabled={!selectedArea}
        className="mt-8 w-full"
        size="lg"
      >
        다음
      </Button>
    </PageTransition>
  );
}
