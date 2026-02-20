"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createCustomQuestion } from "@/actions/custom-question";

interface CustomQuestionFormProps {
  onCreated: () => void;
}

export default function CustomQuestionForm({
  onCreated,
}: CustomQuestionFormProps) {
  const t = useTranslations("questions");
  const tCommon = useTranslations("common");
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
      setError(t("error_fill_all"));
      return;
    }
    if (!preferred) {
      setError(t("error_select_preferred"));
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
        + {t("create_title")}
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-stranger-mid p-5">
      <h3 className="mb-4 text-sm font-bold text-stranger-light">
        {t("create_title")}
      </h3>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-gray-400">{t("create_question_label")}</label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={t("create_question_placeholder")}
            maxLength={200}
            className="w-full rounded-lg border border-gray-600 bg-stranger-dark px-3 py-2.5 text-sm text-stranger-light placeholder:text-gray-500 focus:border-stranger-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-400">{t("create_option_a")}</label>
          <input
            type="text"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            placeholder={t("create_option_a_placeholder")}
            maxLength={100}
            className="w-full rounded-lg border border-gray-600 bg-stranger-dark px-3 py-2.5 text-sm text-stranger-light placeholder:text-gray-500 focus:border-stranger-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-400">{t("create_option_b")}</label>
          <input
            type="text"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            placeholder={t("create_option_b_placeholder")}
            maxLength={100}
            className="w-full rounded-lg border border-gray-600 bg-stranger-dark px-3 py-2.5 text-sm text-stranger-light placeholder:text-gray-500 focus:border-stranger-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-400">
            {t("create_preferred_label")}
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
              {t("prefer_a")}
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
              {t("prefer_b")}
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
          {tCommon("cancel")}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 rounded-lg bg-stranger-accent py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? tCommon("saving") : t("create_submit")}
        </button>
      </div>
    </div>
  );
}
