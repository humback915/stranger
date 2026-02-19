CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL CHECK (length(content) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 매칭 당사자만 조회 (accepted + completed 모두)
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = messages.match_id
      AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
      AND matches.status IN ('accepted', 'completed')
  )
);

-- 전송은 accepted 상태만 (completed는 읽기 전용)
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = messages.match_id
      AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
      AND matches.status = 'accepted'
  )
);

CREATE INDEX messages_match_created ON messages (match_id, created_at);

-- Realtime 활성화
ALTER TABLE messages REPLICA IDENTITY FULL;
