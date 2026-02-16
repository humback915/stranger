export const PROP_CATEGORIES = [
  "clothing_color",
  "phone_screen",
  "convenience_item",
  "accessory",
  "book_magazine",
] as const;

export type PropCategory = (typeof PROP_CATEGORIES)[number];

export const PROP_CATEGORY_LABELS: Record<PropCategory, string> = {
  clothing_color: "옷 색상",
  phone_screen: "휴대폰 화면",
  convenience_item: "편의점 아이템",
  accessory: "액세서리",
  book_magazine: "책/잡지",
};

export const PROP_OPTIONS: Record<PropCategory, string[]> = {
  clothing_color: [
    "빨간색 상의",
    "파란색 상의",
    "노란색 상의",
    "초록색 상의",
    "흰색 상의",
    "검은색 상의",
    "파란색 모자",
    "빨간색 모자",
    "흰색 운동화",
  ],
  phone_screen: [
    "노란색 배경 화면",
    "하트 이모지 화면",
    "별 이모지 화면",
    "파란색 배경 화면",
    "초록색 배경 화면",
  ],
  convenience_item: [
    "바나나우유",
    "딸기우유",
    "파란색 게토레이",
    "초록색 우산",
    "빨간색 우산",
    "노란색 비닐봉투",
  ],
  accessory: [
    "손목시계",
    "에코백",
    "선글라스",
    "머플러",
    "야구 모자",
    "비니",
  ],
  book_magazine: [
    "아무 책 한 권",
    "오늘자 신문",
    "노란색 표지 책",
    "파란색 표지 책",
  ],
};

/** 모든 허용된 소품 이름 목록 */
export const ALL_ALLOWED_PROPS = Object.values(PROP_OPTIONS).flat();

export function isAllowedProp(
  category: string,
  propName: string
): boolean {
  if (!PROP_CATEGORIES.includes(category as PropCategory)) return false;
  return PROP_OPTIONS[category as PropCategory].includes(propName);
}
