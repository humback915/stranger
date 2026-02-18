"use server";

import { createClient } from "@/lib/supabase/server";
import { PLACE_CATEGORIES, PLACE_EXAMPLES } from "@/lib/constants/places";
import { PROP_CATEGORIES, PROP_OPTIONS } from "@/lib/constants/props";
import { IDENTIFICATION_ACTIONS } from "@/lib/constants/actions";
import { createNotification } from "@/actions/notification";
import { generateMatchDescription, generateAIMission } from "@/actions/ai";

/** 두 좌표 간 거리(km) - Haversine 공식 */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 두 사용자의 유사도 + 호환성 점수를 계산
 * - 기본 질문 답변 일치도 (가중치 반영)
 * - 커스텀 질문 선호 답변 일치도 (양방향)
 */
async function calculateScores(
  supabase: ReturnType<typeof createClient>,
  userAId: string,
  userBId: string
) {
  // 1) 기본 질문 답변 비교
  const { data: answersA } = await supabase
    .from("user_answers")
    .select("question_id, answer")
    .eq("user_id", userAId);

  const { data: answersB } = await supabase
    .from("user_answers")
    .select("question_id, answer")
    .eq("user_id", userBId);

  const { data: questions } = await supabase
    .from("questions")
    .select("id, weight")
    .eq("is_active", true);

  if (!answersA || !answersB || !questions) {
    return { similarity: 0, customBonus: 0 };
  }

  const mapA = new Map(answersA.map((a) => [a.question_id, a.answer]));
  const mapB = new Map(answersB.map((a) => [a.question_id, a.answer]));
  const weightMap = new Map(questions.map((q) => [q.id, q.weight]));

  let matchedWeight = 0;
  let totalWeight = 0;

  weightMap.forEach((weight, qId) => {
    const ansA = mapA.get(qId);
    const ansB = mapB.get(qId);
    if (ansA && ansB) {
      totalWeight += weight;
      if (ansA === ansB) {
        matchedWeight += weight;
      }
    }
  });

  const similarity = totalWeight > 0 ? matchedWeight / totalWeight : 0;

  // 2) 커스텀 질문 보너스 (양방향)
  // A가 만든 질문에 B가 선호 답변과 같은 답을 했는지
  const { data: customQsA } = await supabase
    .from("custom_questions")
    .select("id, preferred_answer")
    .eq("author_id", userAId)
    .eq("is_active", true);

  const { data: customAnsB } = await supabase
    .from("custom_question_answers")
    .select("question_id, answer")
    .eq("user_id", userBId);

  // B가 만든 질문에 A가 선호 답변과 같은 답을 했는지
  const { data: customQsB } = await supabase
    .from("custom_questions")
    .select("id, preferred_answer")
    .eq("author_id", userBId)
    .eq("is_active", true);

  const { data: customAnsA } = await supabase
    .from("custom_question_answers")
    .select("question_id, answer")
    .eq("user_id", userAId);

  let customMatched = 0;
  let customTotal = 0;

  // A의 질문 → B의 답변
  if (customQsA && customAnsB) {
    const ansBMap = new Map(customAnsB.map((a) => [a.question_id, a.answer]));
    for (const q of customQsA) {
      const ans = ansBMap.get(q.id);
      if (ans) {
        customTotal++;
        if (ans === q.preferred_answer) customMatched++;
      }
    }
  }

  // B의 질문 → A의 답변
  if (customQsB && customAnsA) {
    const ansAMap = new Map(customAnsA.map((a) => [a.question_id, a.answer]));
    for (const q of customQsB) {
      const ans = ansAMap.get(q.id);
      if (ans) {
        customTotal++;
        if (ans === q.preferred_answer) customMatched++;
      }
    }
  }

  const customBonus = customTotal > 0 ? customMatched / customTotal : 0;

  return { similarity, customBonus };
}

/**
 * 매칭 실행: 현재 사용자와 매칭 가능한 상대를 찾아 matches에 INSERT
 */
export async function runMatching() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  // 현재 사용자 프로필
  const { data: myProfile } = await supabase
    .from("profiles")
    .select(
      "id, gender, birth_year, activity_lat, activity_lng, preferred_gender, preferred_age_min, preferred_age_max, preferred_distance_km, status"
    )
    .eq("id", user.id)
    .single();

  if (!myProfile || myProfile.status !== "active") {
    return { error: "활성 프로필이 필요합니다" };
  }

  // 내 답변이 최소 5개는 있어야 매칭 가능
  const { count: answerCount } = await supabase
    .from("user_answers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!answerCount || answerCount < 5) {
    return { error: "최소 5개 질문에 답변해야 매칭을 시작할 수 있습니다" };
  }

  // 이미 매칭된 상대 제외
  const { data: existingMatches } = await supabase
    .from("matches")
    .select("user_a_id, user_b_id")
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);

  const matchedUserIds = new Set<string>();
  matchedUserIds.add(user.id);
  existingMatches?.forEach((m) => {
    matchedUserIds.add(m.user_a_id);
    matchedUserIds.add(m.user_b_id);
  });

  // 매칭 후보 조회 (성별 선호, 활성 사용자)
  let candidateQuery = supabase
    .from("profiles")
    .select(
      "id, gender, birth_year, activity_lat, activity_lng, preferred_gender"
    )
    .eq("status", "active")
    .neq("id", user.id);

  if (myProfile.preferred_gender !== "any") {
    candidateQuery = candidateQuery.eq("gender", myProfile.preferred_gender);
  }

  const { data: candidates } = await candidateQuery;

  if (!candidates || candidates.length === 0) {
    return { error: "현재 매칭 가능한 상대가 없습니다" };
  }

  const currentYear = new Date().getFullYear();
  const results: Array<{
    userId: string;
    similarity: number;
    compatibility: number;
    distance: number;
  }> = [];

  for (const candidate of candidates) {
    if (matchedUserIds.has(candidate.id)) continue;

    // 상대의 성별 선호 확인
    if (
      candidate.preferred_gender !== "any" &&
      candidate.preferred_gender !== myProfile.gender
    ) {
      continue;
    }

    // 나이 필터
    const candidateAge = currentYear - candidate.birth_year;
    if (
      candidateAge < myProfile.preferred_age_min ||
      candidateAge > myProfile.preferred_age_max
    ) {
      continue;
    }

    // 거리 계산
    const distance = haversineKm(
      myProfile.activity_lat,
      myProfile.activity_lng,
      candidate.activity_lat,
      candidate.activity_lng
    );

    if (distance > myProfile.preferred_distance_km) {
      continue;
    }

    // 점수 계산
    const { similarity, customBonus } = await calculateScores(
      supabase,
      user.id,
      candidate.id
    );

    // 호환성 = 기본 유사도 70% + 커스텀 질문 보너스 30%
    const compatibility =
      customBonus > 0
        ? similarity * 0.7 + customBonus * 0.3
        : similarity;

    results.push({
      userId: candidate.id,
      similarity,
      compatibility,
      distance,
    });
  }

  if (results.length === 0) {
    return { error: "현재 조건에 맞는 매칭 상대가 없습니다" };
  }

  // 호환성 높은 순으로 정렬, 상위 1명 매칭
  results.sort((a, b) => b.compatibility - a.compatibility);
  const best = results[0];

  // user_a_id < user_b_id 제약 조건 준수
  const [userAId, userBId] =
    user.id < best.userId
      ? [user.id, best.userId]
      : [best.userId, user.id];

  const { data: match, error } = await supabase
    .from("matches")
    .insert({
      user_a_id: userAId,
      user_b_id: userBId,
      similarity_score: Math.round(best.similarity * 100) / 100,
      compatibility_score: Math.round(best.compatibility * 100) / 100,
      distance_km: Math.round(best.distance * 10) / 10,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "이미 매칭된 상대입니다" };
    }
    return { error: error.message };
  }

  // AI 호환성 설명 생성 (실패해도 계속 진행)
  try {
    const [{ data: pA }, { data: pB }] = await Promise.all([
      supabase
        .from("profiles")
        .select("nickname, gender, birth_year, occupation, mbti, hobbies, personality, ideal_type")
        .eq("id", userAId)
        .single(),
      supabase
        .from("profiles")
        .select("nickname, gender, birth_year, occupation, mbti, hobbies, personality, ideal_type")
        .eq("id", userBId)
        .single(),
    ]);

    if (pA && pB) {
      const aiDesc = await generateMatchDescription(pA, pB, best.similarity);
      if (aiDesc) {
        await supabase
          .from("matches")
          .update({ ai_description: aiDesc })
          .eq("id", match.id);
      }
    }
  } catch {
    // AI 실패는 무시
  }

  // 양쪽에 새 매칭 알림
  await Promise.all([
    createNotification({
      userId: user.id,
      type: "match_new",
      title: "새로운 매칭!",
      body: `호환도 ${Math.round(best.compatibility * 100)}%인 상대가 매칭되었습니다`,
      relatedMatchId: match.id,
    }),
    createNotification({
      userId: best.userId,
      type: "match_new",
      title: "새로운 매칭!",
      body: `호환도 ${Math.round(best.compatibility * 100)}%인 상대가 매칭되었습니다`,
      relatedMatchId: match.id,
    }),
  ]);

  return {
    success: true,
    matchId: match.id,
    compatibility: Math.round(best.compatibility * 100),
    distance: Math.round(best.distance * 10) / 10,
  };
}

/**
 * 내 매칭 목록 조회
 */
export async function getMyMatches() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const { data: matches, error } = await supabase
    .from("matches")
    .select(
      "id, user_a_id, user_b_id, similarity_score, compatibility_score, distance_km, user_a_accepted, user_b_accepted, status, ai_description, created_at"
    )
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  // 각 매칭의 상대 프로필 + 미션 ID 조회
  const matchesWithPartner = await Promise.all(
    (matches ?? []).map(async (match) => {
      const partnerId =
        match.user_a_id === user.id ? match.user_b_id : match.user_a_id;

      const { data: partner } = await supabase
        .from("profiles")
        .select("id, nickname, gender, birth_year, occupation, mbti, hobbies, personality, ideal_type, photo_urls, activity_area, preferred_gender, preferred_age_min, preferred_age_max, preferred_distance_km")
        .eq("id", partnerId)
        .single();

      // 매칭에 연결된 미션 조회
      const { data: mission } = await supabase
        .from("missions")
        .select("id")
        .eq("match_id", match.id)
        .limit(1)
        .maybeSingle();

      return {
        ...match,
        role: match.user_a_id === user.id ? ("user_a" as const) : ("user_b" as const),
        partner,
        missionId: mission?.id ?? null,
      };
    })
  );

  return { matches: matchesWithPartner };
}

/** 배열에서 랜덤 요소 선택 */
function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 양쪽 수락 시 미션 자동 생성
 */
async function generateMission(
  supabase: ReturnType<typeof createClient>,
  matchId: number,
  userAId: string,
  userBId: string
) {
  // 두 사용자 프로필 조회 (좌표 + AI용 정보)
  const { data: profileA } = await supabase
    .from("profiles")
    .select("activity_lat, activity_lng, nickname, gender, birth_year, occupation, mbti, hobbies, personality, ideal_type")
    .eq("id", userAId)
    .single();

  const { data: profileB } = await supabase
    .from("profiles")
    .select("activity_lat, activity_lng, nickname, gender, birth_year, occupation, mbti, hobbies, personality, ideal_type")
    .eq("id", userBId)
    .single();

  const midLat = profileA && profileB
    ? (profileA.activity_lat + profileB.activity_lat) / 2
    : 37.5665;
  const midLng = profileA && profileB
    ? (profileA.activity_lng + profileB.activity_lng) / 2
    : 126.978;

  // AI 미션 생성 시도 → 실패 시 랜덤 폴백
  let placeCategory = pickRandom(PLACE_CATEGORIES);
  let placeName = pickRandom(PLACE_EXAMPLES[placeCategory]);
  let propCatA = pickRandom(PROP_CATEGORIES);
  let propCatB = pickRandom(PROP_CATEGORIES);
  if (PROP_CATEGORIES.length > 1) {
    while (propCatB === propCatA) {
      propCatB = pickRandom(PROP_CATEGORIES);
    }
  }
  let propNameA = pickRandom(PROP_OPTIONS[propCatA]);
  let propNameB = pickRandom(PROP_OPTIONS[propCatB]);
  let actionA: string = pickRandom(IDENTIFICATION_ACTIONS);
  let actionB: string = pickRandom(IDENTIFICATION_ACTIONS);
  if (IDENTIFICATION_ACTIONS.length > 1) {
    while (actionB === actionA) {
      actionB = pickRandom(IDENTIFICATION_ACTIONS);
    }
  }
  let aiPlaceRationale: string | null = null;
  let aiPropRationaleA: string | null = null;
  let aiPropRationaleB: string | null = null;

  if (profileA && profileB) {
    try {
      const aiResult = await generateAIMission(profileA, profileB);
      if (aiResult) {
        placeCategory = aiResult.place_category;
        placeName = aiResult.place_name;
        propCatA = aiResult.prop_a_category;
        propNameA = aiResult.prop_a_name;
        propCatB = aiResult.prop_b_category;
        propNameB = aiResult.prop_b_name;
        actionA = aiResult.action_a;
        actionB = aiResult.action_b;
        aiPlaceRationale = aiResult.place_rationale;
        aiPropRationaleA = aiResult.prop_a_rationale;
        aiPropRationaleB = aiResult.prop_b_rationale;
      }
    } catch {
      // AI 실패 → 랜덤 값 그대로 사용
    }
  }

  // 만남 일시: 3일 후 14:00
  const meetingDate = new Date();
  meetingDate.setDate(meetingDate.getDate() + 3);
  const dateStr = meetingDate.toISOString().split("T")[0]; // YYYY-MM-DD
  const timeStr = "14:00";

  const { data: mission, error: missionError } = await supabase
    .from("missions")
    .insert({
      match_id: matchId,
      place_name: placeName,
      place_address: `${placeName} (정확한 주소는 당일 안내)`,
      place_lat: midLat,
      place_lng: midLng,
      place_category: placeCategory,
      user_a_prop_category: propCatA,
      user_a_prop_name: propNameA,
      user_b_prop_category: propCatB,
      user_b_prop_name: propNameB,
      user_a_action: actionA,
      user_b_action: actionB,
      meeting_date: dateStr,
      meeting_time: timeStr,
      ai_place_rationale: aiPlaceRationale,
      ai_prop_rationale_a: aiPropRationaleA,
      ai_prop_rationale_b: aiPropRationaleB,
    })
    .select("id")
    .single();

  if (missionError || !mission) {
    return null;
  }

  // no_show_checks 생성 (데드라인 = 만남 1시간 전)
  const deadlineDate = new Date(`${dateStr}T${timeStr}`);
  deadlineDate.setHours(deadlineDate.getHours() - 1);
  const deadline = deadlineDate.toISOString();

  await supabase.from("no_show_checks").insert([
    { mission_id: mission.id, user_id: userAId, check_deadline: deadline },
    { mission_id: mission.id, user_id: userBId, check_deadline: deadline },
  ]);

  return mission.id;
}

/**
 * 매칭 수락/거절 (양쪽 모두 수락해야 최종 매칭)
 */
export async function respondToMatch(
  matchId: number,
  accept: boolean
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "인증되지 않은 사용자입니다" };
  }

  const { data: match } = await supabase
    .from("matches")
    .select(
      "id, user_a_id, user_b_id, user_a_accepted, user_b_accepted, status"
    )
    .eq("id", matchId)
    .single();

  if (!match) {
    return { error: "매칭을 찾을 수 없습니다" };
  }

  const isUserA = match.user_a_id === user.id;
  const isUserB = match.user_b_id === user.id;

  if (!isUserA && !isUserB) {
    return { error: "이 매칭의 참가자가 아닙니다" };
  }

  if (match.status !== "pending") {
    return { error: "이미 처리된 매칭입니다" };
  }

  // 이미 응답했는지 확인
  const myCurrentAnswer = isUserA
    ? match.user_a_accepted
    : match.user_b_accepted;
  if (myCurrentAnswer !== null) {
    return { error: "이미 응답한 매칭입니다" };
  }

  // 내 응답 기록
  const updateField = isUserA
    ? { user_a_accepted: accept }
    : { user_b_accepted: accept };

  const { error: updateError } = await supabase
    .from("matches")
    .update(updateField)
    .eq("id", matchId);

  if (updateError) {
    return { error: updateError.message };
  }

  // 거절 시 즉시 rejected
  if (!accept) {
    await supabase
      .from("matches")
      .update({ status: "rejected" })
      .eq("id", matchId);

    // 상대방에게 거절 알림
    const partnerId = isUserA ? match.user_b_id : match.user_a_id;
    await createNotification({
      userId: partnerId,
      type: "match_rejected",
      title: "매칭 거절",
      body: "상대방이 매칭을 거절했습니다",
      relatedMatchId: matchId,
    });

    return { success: true, status: "rejected" as const, myAccepted: false };
  }

  // 수락 시 상대방 응답 확인
  const partnerAccepted = isUserA
    ? match.user_b_accepted
    : match.user_a_accepted;

  if (partnerAccepted === true) {
    // 양쪽 모두 수락 → accepted + 미션 자동 생성
    await supabase
      .from("matches")
      .update({ status: "accepted" })
      .eq("id", matchId);

    const missionId = await generateMission(
      supabase,
      matchId,
      match.user_a_id,
      match.user_b_id
    );

    // 양쪽 모두에게 매칭 성사 알림
    await Promise.all([
      createNotification({
        userId: match.user_a_id,
        type: "match_accepted",
        title: "매칭 성사!",
        body: "양쪽 모두 수락하여 매칭이 성사되었습니다",
        relatedMatchId: matchId,
        relatedMissionId: missionId,
      }),
      createNotification({
        userId: match.user_b_id,
        type: "match_accepted",
        title: "매칭 성사!",
        body: "양쪽 모두 수락하여 매칭이 성사되었습니다",
        relatedMatchId: matchId,
        relatedMissionId: missionId,
      }),
    ]);

    if (missionId) {
      await Promise.all([
        createNotification({
          userId: match.user_a_id,
          type: "mission_created",
          title: "미션이 생성되었습니다!",
          body: "매칭 상대와의 미션을 확인해보세요",
          relatedMatchId: matchId,
          relatedMissionId: missionId,
        }),
        createNotification({
          userId: match.user_b_id,
          type: "mission_created",
          title: "미션이 생성되었습니다!",
          body: "매칭 상대와의 미션을 확인해보세요",
          relatedMatchId: matchId,
          relatedMissionId: missionId,
        }),
      ]);
    }

    return {
      success: true,
      status: "accepted" as const,
      myAccepted: true,
      missionId,
    };
  }

  // 상대가 아직 미응답 → pending 유지, 상대에게 수락 알림
  const partnerId = isUserA ? match.user_b_id : match.user_a_id;
  await createNotification({
    userId: partnerId,
    type: "match_accepted",
    title: "상대방이 수락했습니다!",
    body: "매칭 상대가 수락했습니다. 당신도 응답해주세요",
    relatedMatchId: matchId,
  });

  return {
    success: true,
    status: "pending" as const,
    myAccepted: true,
  };
}
