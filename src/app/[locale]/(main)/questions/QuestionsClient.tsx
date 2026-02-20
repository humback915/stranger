"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import QuestionCard from "@/components/questions/QuestionCard";
import CustomQuestionForm from "@/components/questions/CustomQuestionForm";
import CustomQuestionCard from "@/components/questions/CustomQuestionCard";
import { deleteCustomQuestion } from "@/actions/custom-question";

interface Question {
  id: number;
  category: string;
  question_text: string;
  option_a: string;
  option_b: string;
  weight: number;
}

interface CustomQuestion {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  preferred_answer: string;
  created_at: string;
}

interface AuthorProfile {
  id: string;
  gender: string;
  birth_year: number;
  mbti: string | null;
  activity_area: string;
  preferred_gender: string;
  preferred_age_min: number;
  preferred_age_max: number;
  preferred_distance_km: number;
}

interface CustomQuestionToAnswer {
  id: number;
  author_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  created_at: string;
  author: AuthorProfile | null;
}

interface AnsweredCustomQuestion extends CustomQuestionToAnswer {
  myAnswer: "a" | "b";
}

type Tab = "basic" | "custom" | "answer";

interface QuestionsClientProps {
  questions: Question[];
  initialAnsweredMap: Record<number, string>;
  totalCount: number;
  initialAnsweredCount: number;
  myCustomQuestions: CustomQuestion[];
  customQuestionsToAnswer: CustomQuestionToAnswer[];
  answeredCustomQuestions: AnsweredCustomQuestion[];
}

export default function QuestionsClient({
  questions,
  initialAnsweredMap,
  totalCount,
  initialAnsweredCount,
  myCustomQuestions,
  customQuestionsToAnswer,
  answeredCustomQuestions,
}: QuestionsClientProps) {
  const t = useTranslations("questions");
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("basic");
  const [answeredMap, setAnsweredMap] = useState<Record<number, string>>(
    initialAnsweredMap
  );
  const [answeredCount, setAnsweredCount] = useState(initialAnsweredCount);

  const unanswered = questions.filter((q) => !answeredMap[q.id]);
  const answered = questions.filter((q) => answeredMap[q.id]);

  const handleAnswered = (questionId: number, answer: "a" | "b") => {
    setAnsweredMap((prev) => {
      const isNew = !prev[questionId];
      if (isNew) {
        setAnsweredCount((c) => c + 1);
      }
      return { ...prev, [questionId]: answer };
    });
  };

  const progressPercent =
    totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "basic", label: t("tab_basic"), badge: unanswered.length || undefined },
    { key: "custom", label: t("tab_custom"), badge: myCustomQuestions.length || undefined },
    { key: "answer", label: t("tab_answer"), badge: customQuestionsToAnswer.length || undefined },
  ];

  return (
    <div className="px-4 pb-24 pt-6">
      <h1 className="text-2xl font-bold text-stranger-light">{t("title")}</h1>
      <p className="mt-1 text-sm text-gray-400">
        {t("subtitle")}
      </p>

      {/* 탭 */}
      <div className="mt-4 flex gap-1 rounded-xl bg-stranger-dark p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
              tab === t.key
                ? "bg-stranger-mid text-stranger-light"
                : "text-gray-500 hover:text-gray-400"
            }`}
          >
            {t.label}
            {t.badge ? (
              <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-stranger-accent px-1 text-[10px] text-white">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* 기본 질문 탭 */}
      {tab === "basic" && (
        <>
          {/* 진행도 바 */}
          <div className="mt-4 rounded-xl bg-stranger-mid p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-400">{t("progress_label")}</span>
              <span className="font-medium text-stranger-accent">
                {answeredCount} / {totalCount}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stranger-dark">
              <div
                className="h-full rounded-full bg-stranger-accent transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {unanswered.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-3 text-sm font-medium text-gray-400">
                {t("unanswered_section")}
              </h2>
              <div className="flex flex-col gap-3">
                {unanswered.map((q, i) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    existingAnswer={null}
                    index={i}
                    total={unanswered.length}
                    onAnswered={handleAnswered}
                  />
                ))}
              </div>
            </div>
          )}

          {unanswered.length === 0 && totalCount > 0 && (
            <div className="mt-6 rounded-2xl bg-stranger-mid p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-600/20">
                <svg
                  className="h-7 w-7 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-stranger-light">
                {t("all_answered_title")}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {t("all_answered_desc")}
              </p>
            </div>
          )}

          {answered.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-medium text-gray-400">
                {t("answered_section", { count: answered.length })}
              </h2>
              <div className="flex flex-col gap-3">
                {answered.map((q, i) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    existingAnswer={answeredMap[q.id] as "a" | "b"}
                    index={i}
                    total={answered.length}
                    onAnswered={handleAnswered}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 내 커스텀 질문 탭 */}
      {tab === "custom" && (
        <div className="mt-4 space-y-3">
          <CustomQuestionForm onCreated={() => router.refresh()} />

          {myCustomQuestions.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-3 text-sm font-medium text-gray-400">
                {t("my_questions_section", { count: myCustomQuestions.length })}
              </h2>
              <div className="flex flex-col gap-3">
                {myCustomQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-2xl bg-stranger-mid p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
                        {t("my_question_badge")}
                      </span>
                      <button
                        onClick={async () => {
                          await deleteCustomQuestion(q.id);
                          router.refresh();
                        }}
                        className="text-xs text-gray-500 hover:text-red-400"
                      >
                        삭제
                      </button>
                    </div>
                    <h3 className="mb-2 text-sm font-bold text-stranger-light">
                      {q.question_text}
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      <div
                        className={`rounded-lg border px-3 py-2 text-xs ${
                          q.preferred_answer === "a"
                            ? "border-stranger-accent/50 bg-stranger-accent/10 text-stranger-light"
                            : "border-gray-700 text-gray-400"
                        }`}
                      >
                        A. {q.option_a}
                        {q.preferred_answer === "a" && (
                          <span className="ml-2 text-stranger-accent">
                            {t("preferred_label")}
                          </span>
                        )}
                      </div>
                      <div
                        className={`rounded-lg border px-3 py-2 text-xs ${
                          q.preferred_answer === "b"
                            ? "border-stranger-accent/50 bg-stranger-accent/10 text-stranger-light"
                            : "border-gray-700 text-gray-400"
                        }`}
                      >
                        B. {q.option_b}
                        {q.preferred_answer === "b" && (
                          <span className="ml-2 text-stranger-accent">
                            {t("preferred_label")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myCustomQuestions.length === 0 && (
            <div className="mt-4 rounded-2xl bg-stranger-mid p-6 text-center">
              <p className="text-sm text-gray-400 whitespace-pre-line">
                {t("no_custom_questions")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 다른 사람의 커스텀 질문 답변 탭 */}
      {tab === "answer" && (
        <div className="mt-4 space-y-3">
          {customQuestionsToAnswer.length > 0 && (
            <>
              <h2 className="text-sm font-medium text-gray-400">
                {t("pending_answers_section", { count: customQuestionsToAnswer.length })}
              </h2>
              {customQuestionsToAnswer.map((q) => (
                <CustomQuestionCard
                  key={q.id}
                  question={q}
                  onAnswered={() => router.refresh()}
                />
              ))}
            </>
          )}

          {customQuestionsToAnswer.length === 0 && (
            <div className="rounded-2xl bg-stranger-mid p-6 text-center">
              <p className="text-sm text-gray-400 whitespace-pre-line">
                {t("no_pending_answers")}
              </p>
            </div>
          )}

          {answeredCustomQuestions.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-3 text-sm font-medium text-gray-400">
                {t("answered_others_section", { count: answeredCustomQuestions.length })}
              </h2>
              {answeredCustomQuestions.map((q) => (
                <CustomQuestionCard
                  key={q.id}
                  question={q}
                  existingAnswer={q.myAnswer}
                  onAnswered={() => router.refresh()}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
