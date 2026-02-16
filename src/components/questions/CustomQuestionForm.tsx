"use client";

import { useState, useTransition } from "react";
import { createCustomQuestion } from "@/actions/custom-question";

interface CustomQuestionFormProps {
  onCreated: () => void;
}

export default function CustomQuestionForm({
  onCreated,
}: CustomQuestionFormProps) {
  const [open, setOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [preferred, setPreferred] = useState<"a" | "b" | "">("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const reset = () => {
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setPreferred("");
    setError("");
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!questionText.trim() || !optionA.trim() || !optionB.trim()) {
      setError("모든 항목을 입력해주세요");
      return;
    }
    if (!preferred) {
      setError("선호하는 답변을 선택해주세요");
      return;
    }

    startTransition(async () => {
      const result = await createCustomQuestion({
        question_text: questionText,
        option_a: optionA,
        option_b: optionB,
        preferred_answer: preferred,
      });

      if (result.error) {
        setError(result.error);
      } else {
        reset();
        onCreated();
      }
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-gray-600 px-4 py-4 text-sm text-gray-400 transition-colors hover:border-stranger-accent hover:text-stranger-accent"
      >
        + 나만의 질문 만들기
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-stranger-mid p-5">
      <h3 className="mb-4 text-sm font-bold text-stranger-light">
        나만의 질문 만들기
      </h3>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-gray-400">질문</label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="상대에게 물어보고 싶은 질문"
            maxLength={200}
            className="w-full rounded-lg border border-gray-600 bg-stranger-dark px-3 py-2.5 text-sm text-stranger-light placeholder:text-gray-500 focus:border-stranger-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-400">선택지 A</label>
          <input
            type="text"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            placeholder="첫 번째 선택지"
            maxLength={100}
            className="w-full rounded-lg border border-gray-600 bg-stranger-dark px-3 py-2.5 text-sm text-stranger-light placeholder:text-gray-500 focus:border-stranger-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-400">선택지 B</label>
          <input
            type="text"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            placeholder="두 번째 선택지"
            maxLength={100}
            className="w-full rounded-lg border border-gray-600 bg-stranger-dark px-3 py-2.5 text-sm text-stranger-light placeholder:text-gray-500 focus:border-stranger-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-400">
            내가 선호하는 답변 (상대에게는 보이지 않음)
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPreferred("a")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                preferred === "a"
                  ? "border-stranger-accent bg-stranger-accent/20 text-stranger-light"
                  : "border-gray-600 text-gray-400"
              }`}
            >
              A 선호
            </button>
            <button
              type="button"
              onClick={() => setPreferred("b")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                preferred === "b"
                  ? "border-stranger-accent bg-stranger-accent/20 text-stranger-light"
                  : "border-gray-600 text-gray-400"
              }`}
            >
              B 선호
            </button>
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          onClick={reset}
          className="flex-1 rounded-lg border border-gray-600 py-2.5 text-sm text-gray-400"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 rounded-lg bg-stranger-accent py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "저장 중..." : "질문 만들기"}
        </button>
      </div>
    </div>
  );
}
