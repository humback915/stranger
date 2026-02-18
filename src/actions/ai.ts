"use server";

import { getOpenAIClient } from "@/lib/openai";
import { PLACE_CATEGORIES, PLACE_EXAMPLES } from "@/lib/constants/places";
import { PROP_CATEGORIES, PROP_OPTIONS } from "@/lib/constants/props";
import { IDENTIFICATION_ACTIONS } from "@/lib/constants/actions";
import type { PlaceCategory } from "@/lib/constants/places";
import type { PropCategory } from "@/lib/constants/props";

interface UserProfile {
  nickname: string;
  gender: string;
  birth_year: number;
  occupation: string;
  mbti: string | null;
  hobbies: string[];
  personality: string[];
  ideal_type: string[];
}

/**
 * 두 사용자의 호환성 설명을 AI로 생성 (2-3문장 한국어)
 * 실패 시 null 반환 (fallback: 기존 매칭 정보만 표시)
 */
export async function generateMatchDescription(
  profileA: UserProfile,
  profileB: UserProfile,
  similarityScore: number
): Promise<string | null> {
  const openai = getOpenAIClient();
  if (!openai) return null;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "당신은 소개팅 앱의 매칭 분석가입니다. 두 사용자의 프로필을 바탕으로 호환성 분석을 2-3문장의 자연스러운 한국어로 작성해주세요. 긍정적이고 따뜻한 톤으로 작성하되, 구체적인 공통점이나 보완점을 언급해주세요.",
        },
        {
          role: "user",
          content: `사용자 A: ${profileA.occupation}, ${profileA.mbti ?? "MBTI 미입력"}, 취미: ${profileA.hobbies.join(", ") || "없음"}, 성격: ${profileA.personality.join(", ") || "없음"}
사용자 B: ${profileB.occupation}, ${profileB.mbti ?? "MBTI 미입력"}, 취미: ${profileB.hobbies.join(", ") || "없음"}, 성격: ${profileB.personality.join(", ") || "없음"}
유사도: ${Math.round(similarityScore * 100)}%

이 두 사람의 호환성을 분석해주세요.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() ?? null;
  } catch (error) {
    console.error("[AI] Match description generation failed:", error);
    return null;
  }
}

interface AIMissionResult {
  place_category: PlaceCategory;
  place_name: string;
  place_rationale: string;
  prop_a_category: PropCategory;
  prop_a_name: string;
  prop_a_rationale: string;
  prop_b_category: PropCategory;
  prop_b_name: string;
  prop_b_rationale: string;
  action_a: string;
  action_b: string;
}

/**
 * AI로 프로필 기반 미션 생성 (장소/소품/행동 선택)
 * JSON 모드 사용, 허용 목록과 교차 검증
 * 실패 시 null 반환 (fallback: 기존 랜덤 로직)
 */
export async function generateAIMission(
  profileA: UserProfile,
  profileB: UserProfile
): Promise<AIMissionResult | null> {
  const openai = getOpenAIClient();
  if (!openai) return null;

  const placeCategoriesList = PLACE_CATEGORIES.join(", ");
  const placeExamplesList = PLACE_CATEGORIES.map(
    (cat) => `${cat}: [${PLACE_EXAMPLES[cat].join(", ")}]`
  ).join("\n");
  const propCategoriesList = PROP_CATEGORIES.join(", ");
  const propOptionsList = PROP_CATEGORIES.map(
    (cat) => `${cat}: [${PROP_OPTIONS[cat].join(", ")}]`
  ).join("\n");
  const actionsList = IDENTIFICATION_ACTIONS.join(", ");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `당신은 소개팅 미션 설계자입니다. 두 사용자의 프로필에 맞는 만남 장소, 식별 소품, 식별 행동을 선택하세요.

반드시 아래 허용 목록에서만 선택하세요:

장소 카테고리: ${placeCategoriesList}
장소 이름 (카테고리별):
${placeExamplesList}

소품 카테고리: ${propCategoriesList}
소품 이름 (카테고리별):
${propOptionsList}

식별 행동 목록: ${actionsList}

두 사용자에게 서로 다른 소품 카테고리와 서로 다른 행동을 배정하세요.

JSON 형식으로 응답:
{
  "place_category": "카테고리",
  "place_name": "장소명",
  "place_rationale": "이 장소를 선택한 이유 (1문장)",
  "prop_a_category": "소품카테고리",
  "prop_a_name": "소품명",
  "prop_a_rationale": "A에게 이 소품을 배정한 이유 (1문장)",
  "prop_b_category": "소품카테고리",
  "prop_b_name": "소품명",
  "prop_b_rationale": "B에게 이 소품을 배정한 이유 (1문장)",
  "action_a": "행동",
  "action_b": "행동"
}`,
        },
        {
          role: "user",
          content: `사용자 A: ${profileA.occupation}, ${profileA.mbti ?? "MBTI 미입력"}, 취미: ${profileA.hobbies.join(", ") || "없음"}, 성격: ${profileA.personality.join(", ") || "없음"}, 이상형: ${profileA.ideal_type.join(", ") || "없음"}
사용자 B: ${profileB.occupation}, ${profileB.mbti ?? "MBTI 미입력"}, 취미: ${profileB.hobbies.join(", ") || "없음"}, 성격: ${profileB.personality.join(", ") || "없음"}, 이상형: ${profileB.ideal_type.join(", ") || "없음"}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as AIMissionResult;

    // 허용 목록 교차 검증
    if (!PLACE_CATEGORIES.includes(parsed.place_category)) return null;
    if (!PLACE_EXAMPLES[parsed.place_category].includes(parsed.place_name)) {
      // 장소명이 목록에 없으면 해당 카테고리에서 첫 번째 선택
      parsed.place_name = PLACE_EXAMPLES[parsed.place_category][0];
    }
    if (!PROP_CATEGORIES.includes(parsed.prop_a_category)) return null;
    if (!PROP_OPTIONS[parsed.prop_a_category].includes(parsed.prop_a_name)) {
      parsed.prop_a_name = PROP_OPTIONS[parsed.prop_a_category][0];
    }
    if (!PROP_CATEGORIES.includes(parsed.prop_b_category)) return null;
    if (!PROP_OPTIONS[parsed.prop_b_category].includes(parsed.prop_b_name)) {
      parsed.prop_b_name = PROP_OPTIONS[parsed.prop_b_category][0];
    }
    if (
      !IDENTIFICATION_ACTIONS.includes(
        parsed.action_a as (typeof IDENTIFICATION_ACTIONS)[number]
      )
    ) {
      parsed.action_a = IDENTIFICATION_ACTIONS[0];
    }
    if (
      !IDENTIFICATION_ACTIONS.includes(
        parsed.action_b as (typeof IDENTIFICATION_ACTIONS)[number]
      )
    ) {
      parsed.action_b = IDENTIFICATION_ACTIONS[1];
    }

    return parsed;
  } catch (error) {
    console.error("[AI] Mission generation failed:", error);
    return null;
  }
}
