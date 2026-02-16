-- 질문 카테고리 ENUM
CREATE TYPE question_category AS ENUM (
  'values',       -- 가치관
  'lifestyle',    -- 라이프스타일
  'romance',      -- 연애관
  'personality',  -- 성격
  'taste'         -- 취향
);

-- questions: 양자택일 질문
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  category question_category NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1 CHECK (weight BETWEEN 1 AND 5),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_active ON questions (is_active) WHERE is_active = true;
