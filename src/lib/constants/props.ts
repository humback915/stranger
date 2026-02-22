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

export const PROP_OPTIONS_EN: Record<PropCategory, string[]> = {
  clothing_color: [
    "Red Top",
    "Blue Top",
    "Yellow Top",
    "Green Top",
    "White Top",
    "Black Top",
    "Blue Hat",
    "Red Hat",
    "White Sneakers",
  ],
  phone_screen: [
    "Yellow Wallpaper",
    "Heart Emoji Screen",
    "Star Emoji Screen",
    "Blue Wallpaper",
    "Green Wallpaper",
  ],
  convenience_item: [
    "Banana Milk",
    "Strawberry Milk",
    "Blue Gatorade",
    "Green Umbrella",
    "Red Umbrella",
    "Yellow Plastic Bag",
  ],
  accessory: [
    "Wristwatch",
    "Eco Bag",
    "Sunglasses",
    "Scarf",
    "Baseball Cap",
    "Beanie",
  ],
  book_magazine: [
    "Any Book",
    "Today's Newspaper",
    "Yellow Cover Book",
    "Blue Cover Book",
  ],
};

export const PROP_OPTIONS_JA: Record<PropCategory, string[]> = {
  clothing_color: [
    "赤いトップス",
    "青いトップス",
    "黄色いトップス",
    "緑のトップス",
    "白いトップス",
    "黒いトップス",
    "青い帽子",
    "赤い帽子",
    "白いスニーカー",
  ],
  phone_screen: [
    "黄色い壁紙",
    "ハートの絵文字画面",
    "星の絵文字画面",
    "青い壁紙",
    "緑の壁紙",
  ],
  convenience_item: [
    "バナナ牛乳",
    "イチゴ牛乳",
    "青いゲータレード",
    "緑の傘",
    "赤い傘",
    "黄色いビニール袋",
  ],
  accessory: [
    "腕時計",
    "エコバッグ",
    "サングラス",
    "マフラー",
    "野球帽",
    "ニット帽",
  ],
  book_magazine: [
    "本一冊",
    "今日の新聞",
    "黄色い表紙の本",
    "青い表紙の本",
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

/** 소품 이름을 로케일에 맞게 변환 */
export function localizePropName(
  category: string,
  propName: string,
  locale: string
): string {
  if (locale === "ko") return propName;
  const cat = category as PropCategory;
  if (!PROP_CATEGORIES.includes(cat)) return propName;

  const koList = PROP_OPTIONS[cat];
  const idx = koList.indexOf(propName);
  if (idx === -1) return propName;

  const localizedList = locale === "en" ? PROP_OPTIONS_EN[cat] : PROP_OPTIONS_JA[cat];
  return localizedList[idx] ?? propName;
}
