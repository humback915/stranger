"use server";

import { createClient } from "@/lib/supabase/server";

export async function getQuestions() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  // 활성 질문 전체 조회
  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("id, category, question_text, option_a, option_b, weight")
    .eq("is_active", true)
    .order("id");

  if (qError) {
    return { error: qError.message };
  }

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
    questions: questions ?? [],
    answeredMap: Object.fromEntries(answeredMap),
    totalCount: questions?.length ?? 0,
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
