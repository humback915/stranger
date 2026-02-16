export const PLACE_CATEGORIES = [
  "cafe",
  "bookstore",
  "park",
  "museum",
  "library",
  "mall",
  "restaurant",
] as const;

export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export const PLACE_CATEGORY_LABELS: Record<PlaceCategory, string> = {
  cafe: "카페",
  bookstore: "서점",
  park: "공원/광장",
  museum: "미술관/박물관",
  library: "도서관",
  mall: "대형 쇼핑몰 푸드코트",
  restaurant: "프랜차이즈 레스토랑",
};

/** 카테고리별 대표 장소 예시 (AI 프롬프트 및 UI 힌트용) */
export const PLACE_EXAMPLES: Record<PlaceCategory, string[]> = {
  cafe: ["스타벅스", "투썸플레이스", "이디야커피", "할리스"],
  bookstore: ["교보문고", "영풍문고", "알라딘 매장"],
  park: ["여의도 한강공원", "올림픽공원", "서울숲", "남산공원"],
  museum: ["국립현대미술관", "서울시립미술관", "국립중앙박물관"],
  library: ["국립중앙도서관", "서울도서관", "구립도서관"],
  mall: ["코엑스 푸드코트", "타임스퀘어", "IFC몰"],
  restaurant: ["빕스", "아웃백", "애슐리"],
};

export function isOpenPlace(category: string): category is PlaceCategory {
  return PLACE_CATEGORIES.includes(category as PlaceCategory);
}
