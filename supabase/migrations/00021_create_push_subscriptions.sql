-- 푸시 알림 구독 테이블
CREATE TABLE push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  device_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, fcm_token)
);

-- RLS 활성화
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 본인 구독만 조회/삽입/삭제 가능
CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
