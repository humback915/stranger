"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * 내 커스텀 질문 생성
 */
export async function createCustomQuestion(input: {
  question_text: string;
  option_a: string;
  option_b: string;
  preferred_answer: "a" | "b";
}) {
  if (
    !input.question_text.trim() ||
    !input.option_a.trim() ||
    !input.option_b.trim()
  ) {
    return { error: "질문과 선택지를 모두 입력해주세요" };
  }

  if (input.question_text.length > 200) {
    return { error: "질문은 200자 이내로 입력해주세요" };
  }

  if (input.option_a.length > 100 || input.option_b.length > 100) {
    return { error: "선택지는 100자 이내로 입력해주세요" };
  }

  if (!["a", "b"].includes(input.preferred_answer)) {
    return { error: "선호 답변을 선택해주세요" };
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  // 사용자당 최대 10개 커스텀 질문
  const { count } = await supabase
    .from("custom_questions")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id)
    .eq("is_active", true);

  if (count && count >= 10) {
    return { error: "커스텀 질문은 최대 10개까지 만들 수 있습니다" };
  }

  const { data, error } = await supabase
    .from("custom_questions")
    .insert({
      author_id: user.id,
      question_text: input.question_text.trim(),
      option_a: input.option_a.trim(),
      option_b: input.option_b.trim(),
      preferred_answer: input.preferred_answer,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, questionId: data.id };
}

/**
 * 내 커스텀 질문 목록 조회
 */
export async function getMyCustomQuestions() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const { data, error } = await supabase
    .from("custom_questions")
    .select("id, question_text, option_a, option_b, preferred_answer, created_at")
    .eq("author_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { questions: data ?? [] };
}

/**
 * 다른 사용자들의 커스텀 질문 중 내가 아직 답하지 않은 것 조회
 */
export async function getCustomQuestionsToAnswer() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  // 내가 만든 것 제외, 활성 질문만
  const { data: allQuestions, error: qError } = await supabase
    .from("custom_questions")
    .select("id, author_id, question_text, option_a, option_b, created_at")
    .eq("is_active", true)
    .neq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (qError) {
    return { error: qError.message };
  }

  // 내가 이미 답한 질문 ID
  const { data: myAnswers } = await supabase
    .from("custom_question_answers")
    .select("question_id, answer")
    .eq("user_id", user.id);

  const answeredMap = new Map(
    myAnswers?.map((a) => [a.question_id, a.answer]) ?? []
  );

  // 작성자 프로필 조회
  const authorIds = Array.from(new Set((allQuestions ?? []).map((q) => q.author_id)));
  const { data: authorProfiles } = authorIds.length > 0
    ? await supabase
        .from("profiles")
        .select(
          "id, gender, birth_year, mbti, hobbies, personality, ideal_type, activity_area, preferred_gender, preferred_age_min, preferred_age_max, preferred_distance_km"
        )
        .in("id", authorIds)
    : { data: [] };

  const profileMap = new Map(
    (authorProfiles ?? []).map((p) => [p.id, p])
  );

  const attachAuthor = (q: (typeof allQuestions)[0]) => ({
    ...q,
    author: profileMap.get(q.author_id) ?? null,
  });

  const unanswered = (allQuestions ?? []).filter(
    (q) => !answeredMap.has(q.id)
  );
  const answered = (allQuestions ?? []).filter(
    (q) => answeredMap.has(q.id)
  );

  return {
    unanswered: unanswered.map(attachAuthor),
    answered: answered.map((q) => ({
      ...attachAuthor(q),
      myAnswer: answeredMap.get(q.id) as "a" | "b",
    })),
  };
}

/**
 * 커스텀 질문에 답변
 */
export async function answerCustomQuestion(
  questionId: number,
  answer: "a" | "b"
) {
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

  // 질문 존재 여부 & 자기 질문이 아닌지 확인
  const { data: question } = await supabase
    .from("custom_questions")
    .select("id, author_id")
    .eq("id", questionId)
    .eq("is_active", true)
    .single();

  if (!question) {
    return { error: "질문을 찾을 수 없습니다" };
  }

  if (question.author_id === user.id) {
    return { error: "자신이 만든 질문에는 답변할 수 없습니다" };
  }

  const { error } = await supabase.from("custom_question_answers").upsert(
    {
      question_id: questionId,
      user_id: user.id,
      answer,
    },
    { onConflict: "question_id,user_id" }
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * 내 커스텀 질문 삭제 (비활성화)
 */
export async function deleteCustomQuestion(questionId: number) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const { error } = await supabase
    .from("custom_questions")
    .update({ is_active: false })
    .eq("id", questionId)
    .eq("author_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
