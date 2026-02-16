export const IDEAL_TYPES = [
  "유머감각",
  "지적인",
  "다정한",
  "솔직한",
  "자기관리",
  "배려심",
  "대화잘통하는",
  "긍정적인",
  "성실한",
  "야망있는",
  "감성적인",
  "든든한",
  "활발한",
  "차분한",
  "독립적인",
  "가정적인",
  "센스있는",
  "예의바른",
  "취미공유",
  "동물좋아하는",
] as const;

export type IdealType = (typeof IDEAL_TYPES)[number];
