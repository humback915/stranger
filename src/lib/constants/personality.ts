export const PERSONALITIES = [
  "외향적인",
  "내향적인",
  "유머러스한",
  "차분한",
  "활발한",
  "다정한",
  "솔직한",
  "배려심 깊은",
  "긍정적인",
  "감성적인",
  "이성적인",
  "모험적인",
  "꼼꼼한",
  "즉흥적인",
  "리더십 있는",
  "경청하는",
  "창의적인",
  "성실한",
  "낙천적인",
  "독립적인",
] as const;

export type Personality = (typeof PERSONALITIES)[number];
