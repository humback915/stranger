-- missions: 매칭된 사용자의 만남 미션
CREATE TABLE missions (
  id SERIAL PRIMARY KEY,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  place_name TEXT NOT NULL,
  place_address TEXT NOT NULL,
  place_lat DOUBLE PRECISION NOT NULL,
  place_lng DOUBLE PRECISION NOT NULL,
  user_a_prop_name TEXT NOT NULL,
  user_a_prop_description TEXT,
  user_b_prop_name TEXT NOT NULL,
  user_b_prop_description TEXT,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  user_a_departure_confirmed BOOLEAN NOT NULL DEFAULT false,
  user_b_departure_confirmed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_missions_match ON missions (match_id);
CREATE INDEX idx_missions_date ON missions (meeting_date);

CREATE TRIGGER missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
