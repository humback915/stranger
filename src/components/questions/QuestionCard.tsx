"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitAnswer } from "@/actions/question";

interface QuestionCardProps {
  question: {
    id: number;
    category: string;
    question_text: string;
    option_a: string;
    option_b: string;
  };
  existingAnswer?: "a" | "b" | null;
  index: number;
  total: number;
  onAnswered: (questionId: number, answer: "a" | "b") => void;
}

export default function QuestionCard({
  question,
  existingAnswer,
  index,
  total,
  onAnswered,
}: QuestionCardProps) {
  const t = useTranslations("questions");
  const categoryLabels: Record<string, string> = {
    values: t("category_values"),
    lifestyle: t("category_lifestyle"),
    romance: t("category_romance"),
    personality: t("category_personality"),
    taste: t("category_taste"),
  };
  const [selected, setSelected] = useState<"a" | "b" | null>(
    existingAnswer ?? null
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSelect = (answer: "a" | "b") => {
    if (isPending) return;

    setSelected(answer);
    setError("");

    startTransition(async () => {
      const result = await submitAnswer(question.id, answer);
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
      {/* 카테고리 + 진행도 */}
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-md bg-stranger-accent/20 px-2 py-0.5 text-xs text-stranger-accent">
          {categoryLabels[question.category] ?? question.category}
        </span>
        <span className="text-xs text-gray-500">
          {index + 1} / {total}
        </span>
      </div>

      {/* 질문 */}
      <h3 className="mb-4 text-base font-bold text-stranger-light">
        {question.question_text}
      </h3>

      {/* 선택지 */}
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
