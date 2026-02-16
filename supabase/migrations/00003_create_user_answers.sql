-- user_answers: 사용자의 질문 답변
CREATE TABLE user_answers (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL CHECK (answer IN ('a', 'b')),
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

CREATE INDEX idx_user_answers_user ON user_answers (user_id);
CREATE INDEX idx_user_answers_question ON user_answers (question_id);
