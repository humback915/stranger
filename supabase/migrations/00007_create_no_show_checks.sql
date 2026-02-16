-- no_show_checks: 노쇼 확인
CREATE TABLE no_show_checks (
  id SERIAL PRIMARY KEY,
  mission_id INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'no_show')),
  check_deadline TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mission_id, user_id)
);

CREATE INDEX idx_no_show_checks_mission ON no_show_checks (mission_id);
CREATE INDEX idx_no_show_checks_user ON no_show_checks (user_id);
