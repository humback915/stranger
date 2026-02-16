-- 매칭 상태 ENUM
CREATE TYPE match_status AS ENUM (
  'pending',     -- 매칭 대기
  'accepted',    -- 양쪽 수락
  'rejected',    -- 거절됨
  'expired',     -- 만료됨
  'completed'    -- 만남 완료
);

-- matches: 사용자 매칭
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  user_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  similarity_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  compatibility_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  distance_km DOUBLE PRECISION,
  status match_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_a_id < user_b_id)
);

CREATE UNIQUE INDEX idx_matches_pair ON matches (user_a_id, user_b_id);
CREATE INDEX idx_matches_user_a ON matches (user_a_id, status);
CREATE INDEX idx_matches_user_b ON matches (user_b_id, status);

CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
