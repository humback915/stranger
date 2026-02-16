"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/motion/PageTransition";

export default function AgeGenderStep() {
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
      setError("닉네임은 2~10자로 입력해주세요");
      return;
    }

    const year = parseInt(birthYear);
    const currentYear = new Date().getFullYear();

    if (!year || year < 1924 || year > currentYear - 19) {
      setError("만 19세 이상만 가입할 수 있습니다");
      return;
    }
    if (!gender) {
      setError("성별을 선택해주세요");
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
        기본 정보를 알려주세요
      </h2>

      <div className="flex flex-col gap-6">
        <div>
          <label className="mb-2 block text-sm text-gray-400">닉네임</label>
          <input
            type="text"
            placeholder="2~10자 닉네임"
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
          <label className="mb-2 block text-sm text-gray-400">출생연도</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="예: 1995"
            value={birthYear}
            onChange={(e) => {
              setBirthYear(e.target.value);
              setError("");
            }}
            className="w-full rounded-lg bg-stranger-mid px-4 py-3 text-stranger-light placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-stranger-accent"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">성별</label>
          <div className="flex gap-3">
            {(
              [
                { value: "male", label: "남성" },
                { value: "female", label: "여성" },
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
          다음
        </Button>
      </div>
    </PageTransition>
  );
}
