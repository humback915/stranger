"use server";

import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export async function getQuestions() {
  const supabase = createClient();
  const locale = await getLocale();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  // 활성 질문 전체 조회 (번역 컬럼 포함)
  const { data: rawQuestions, error: qError } = await supabase
    .from("questions")
    .select(
      "id, category, weight, question_text, question_text_en, question_text_ja, option_a, option_a_en, option_a_ja, option_b, option_b_en, option_b_ja"
    )
    .eq("is_active", true)
    .order("id");

  if (qError) {
    return { error: qError.message };
  }

  // 로케일에 맞는 텍스트로 변환
  const questions = (rawQuestions ?? []).map((q) => ({
    id: q.id,
    category: q.category,
    weight: q.weight,
    question_text:
      (locale === "en" ? q.question_text_en : locale === "ja" ? q.question_text_ja : null) ??
      q.question_text,
    option_a:
      (locale === "en" ? q.option_a_en : locale === "ja" ? q.option_a_ja : null) ??
      q.option_a,
    option_b:
      (locale === "en" ? q.option_b_en : locale === "ja" ? q.option_b_ja : null) ??
      q.option_b,
  }));

  // 사용자의 기존 답변 조회
  const { data: answers, error: aError } = await supabase
    .from("user_answers")
    .select("question_id, answer")
    .eq("user_id", user.id);

  if (aError) {
    return { error: aError.message };
  }

  const answeredMap = new Map(
    answers?.map((a) => [a.question_id, a.answer]) ?? []
  );

  return {
    questions,
    answeredMap: Object.fromEntries(answeredMap),
    totalCount: questions.length,
    answeredCount: answers?.length ?? 0,
  };
}

export async function submitAnswer(questionId: number, answer: "a" | "b") {
  if (!questionId || !["a", "b"].includes(answer)) {
    return { error: "잘못된 입력입니다" };
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  // upsert: 이미 답변한 질문이면 업데이트
  const { error } = await supabase.from("user_answers").upsert(
    {
      user_id: user.id,
      question_id: questionId,
      answer,
    },
    { onConflict: "user_id,question_id" }
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
