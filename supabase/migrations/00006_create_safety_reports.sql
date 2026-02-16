-- 신고 유형 ENUM
CREATE TYPE report_type AS ENUM (
  'harassment',    -- 괴롭힘
  'inappropriate', -- 부적절한 행동
  'no_show',       -- 노쇼
  'safety',        -- 안전 위협
  'other'          -- 기타
);

-- safety_reports: 안전 신고
CREATE TABLE safety_reports (
  id SERIAL PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id INTEGER REFERENCES missions(id) ON DELETE SET NULL,
  report_type report_type NOT NULL,
  description TEXT,
  reporter_lat DOUBLE PRECISION,
  reporter_lng DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (reporter_id != reported_user_id)
);

CREATE INDEX idx_safety_reports_reporter ON safety_reports (reporter_id);
CREATE INDEX idx_safety_reports_reported ON safety_reports (reported_user_id);
