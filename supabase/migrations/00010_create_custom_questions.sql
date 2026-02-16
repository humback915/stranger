-- 사용자 커스텀 질문
CREATE TABLE custom_questions (
  id SERIAL PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  preferred_answer TEXT NOT NULL CHECK (preferred_answer IN ('a', 'b')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_custom_questions_author ON custom_questions (author_id);
CREATE INDEX idx_custom_questions_active ON custom_questions (is_active) WHERE is_active = true;

-- 커스텀 질문 답변
CREATE TABLE custom_question_answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES custom_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answer TEXT NOT NULL CHECK (answer IN ('a', 'b')),
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (question_id, user_id)
);

CREATE INDEX idx_custom_question_answers_user ON custom_question_answers (user_id);
CREATE INDEX idx_custom_question_answers_question ON custom_question_answers (question_id);

-- RLS
ALTER TABLE custom_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_question_answers ENABLE ROW LEVEL SECURITY;

-- 커스텀 질문: 인증된 사용자 모두 읽기, 본인만 생성/수정
CREATE POLICY "Authenticated users can read active custom questions"
  ON custom_questions FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Users can create own custom questions"
  ON custom_questions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own custom questions"
  ON custom_questions FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- 커스텀 질문 답변: 본인 답변만 CRUD
CREATE POLICY "Users can read own custom answers"
  ON custom_question_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom answers"
  ON custom_question_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom answers"
  ON custom_question_answers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 질문 작성자도 자기 질문에 대한 답변을 볼 수 있도록 (매칭 점수 확인용)
CREATE POLICY "Authors can read answers to own questions"
  ON custom_question_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM custom_questions
      WHERE custom_questions.id = custom_question_answers.question_id
        AND custom_questions.author_id = auth.uid()
    )
  );

select * from profiles p 