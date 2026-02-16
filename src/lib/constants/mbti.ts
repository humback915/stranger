export const MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
] as const;

export type MbtiType = (typeof MBTI_TYPES)[number];

export const MBTI_LABELS: Record<MbtiType, string> = {
  ISTJ: "청렴결백한 논리주의자",
  ISFJ: "용감한 수호자",
  INFJ: "선의의 옹호자",
  INTJ: "용의주도한 전략가",
  ISTP: "만능 재주꾼",
  ISFP: "호기심 많은 예술가",
  INFP: "열정적인 중재자",
  INTP: "논리적인 사색가",
  ESTP: "모험을 즐기는 사업가",
  ESFP: "자유로운 영혼의 연예인",
  ENFP: "재기발랄한 활동가",
  ENTP: "뜨거운 논쟁을 즐기는 변론가",
  ESTJ: "엄격한 관리자",
  ESFJ: "사교적인 외교관",
  ENFJ: "정의로운 사회운동가",
  ENTJ: "대담한 통솔자",
};
