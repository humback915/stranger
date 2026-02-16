"use client";

import { useState, useTransition } from "react";
import { answerCustomQuestion } from "@/actions/custom-question";

const GENDER_LABELS: Record<string, string> = {
  male: "남성",
  female: "여성",
  any: "무관",
};

interface AuthorProfile {
  id: string;
  gender: string;
  birth_year: number;
  mbti: string | null;
  hobbies?: string[];
  personality?: string[];
  ideal_type?: string[];
  activity_area: string;
  preferred_gender: string;
  preferred_age_min: number;
  preferred_age_max: number;
  preferred_distance_km: number;
}

interface CustomQuestionCardProps {
  question: {
    id: number;
    question_text: string;
    option_a: string;
    option_b: string;
    author?: AuthorProfile | null;
  };
  existingAnswer?: "a" | "b" | null;
  onAnswered: (questionId: number, answer: "a" | "b") => void;
}

export default function CustomQuestionCard({
  question,
  existingAnswer,
  onAnswered,
}: CustomQuestionCardProps) {
  const [selected, setSelected] = useState<"a" | "b" | null>(
    existingAnswer ?? null
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const author = question.author;
  const currentYear = new Date().getFullYear();
  const authorAge = author ? currentYear - author.birth_year : null;

  const handleSelect = (answer: "a" | "b") => {
    if (isPending) return;

    setSelected(answer);
    setError("");

    startTransition(async () => {
      const result = await answerCustomQuestion(question.id, answer);
      if (result.error) {
        setError(result.error);
        setSelected(existingAnswer ?? null);
      } else {
        onAnswered(question.id, answer);
      }
    });
  };

  return (
    <div className="rounded-2xl bg-stranger-mid p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
          사용자 질문
        </span>
      </div>

      {/* 작성자 프로필 정보 */}
      {author && (
        <div className="mb-3 mt-2 rounded-xl bg-stranger-dark p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stranger-mid text-sm">
              {author.gender === "male" ? "👨" : "👩"}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-medium text-stranger-light">
                  {GENDER_LABELS[author.gender]} · {authorAge}세
                </span>
                {author.mbti && (
                  <span className="rounded bg-stranger-accent/20 px-1.5 py-0.5 text-[10px] text-stranger-accent">
                    {author.mbti}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{author.activity_area}</p>
            </div>
          </div>
          {(author.hobbies?.length || author.personality?.length) ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {author.hobbies?.map((h) => (
                <span key={h} className="rounded-md bg-stranger-accent/15 px-2 py-0.5 text-[10px] text-stranger-accent">
                  {h}
                </span>
              ))}
              {author.personality?.map((p) => (
                <span key={p} className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] text-purple-400">
                  {p}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-stranger-mid px-2 py-0.5 text-[10px] text-gray-400">
              선호: {GENDER_LABELS[author.preferred_gender]}
            </span>
            <span className="rounded-md bg-stranger-mid px-2 py-0.5 text-[10px] text-gray-400">
              {author.preferred_age_min}~{author.preferred_age_max}세
            </span>
            <span className="rounded-md bg-stranger-mid px-2 py-0.5 text-[10px] text-gray-400">
              {author.preferred_distance_km}km 이내
            </span>
          </div>
        </div>
      )}

      <h3 className="mb-4 text-base font-bold text-stranger-light">
        {question.question_text}
      </h3>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleSelect("a")}
          disabled={isPending}
          className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${
            selected === "a"
              ? "border-stranger-accent bg-stranger-accent/20 text-stranger-light"
              : "border-gray-600 text-gray-400 hover:border-gray-500"
          } disabled:opacity-60`}
        >
          <span className="mr-2 font-medium text-stranger-accent">A.</span>
          {question.option_a}
        </button>
        <button
          onClick={() => handleSelect("b")}
          disabled={isPending}
          className={`rounded-xl border px-4 py-3 text-left text-sm transition-all ${
            selected === "b"
              ? "border-stranger-accent bg-stranger-accent/20 text-stranger-light"
              : "border-gray-600 text-gray-400 hover:border-gray-500"
          } disabled:opacity-60`}
        >
          <span className="mr-2 font-medium text-stranger-accent">B.</span>
          {question.option_b}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
