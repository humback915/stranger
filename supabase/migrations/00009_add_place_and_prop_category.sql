-- missions 테이블에 place_category, prop_category 컬럼 추가
ALTER TABLE missions
  ADD COLUMN place_category TEXT NOT NULL DEFAULT 'cafe'
    CHECK (place_category IN ('cafe', 'bookstore', 'park', 'museum', 'library', 'mall', 'restaurant')),
  ADD COLUMN user_a_prop_category TEXT NOT NULL DEFAULT 'clothing_color'
    CHECK (user_a_prop_category IN ('clothing_color', 'phone_screen', 'convenience_item', 'accessory', 'book_magazine')),
  ADD COLUMN user_b_prop_category TEXT NOT NULL DEFAULT 'clothing_color'
    CHECK (user_b_prop_category IN ('clothing_color', 'phone_screen', 'convenience_item', 'accessory', 'book_magazine'));

-- DEFAULT 제거 (기존 데이터 마이그레이션 후)
ALTER TABLE missions
  ALTER COLUMN place_category DROP DEFAULT,
  ALTER COLUMN user_a_prop_category DROP DEFAULT,
  ALTER COLUMN user_b_prop_category DROP DEFAULT;
