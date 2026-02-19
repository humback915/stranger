CREATE TABLE match_read_cursors (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, match_id)
);

ALTER TABLE match_read_cursors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cursors_select" ON match_read_cursors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "cursors_insert" ON match_read_cursors
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "cursors_update" ON match_read_cursors
  FOR UPDATE USING (user_id = auth.uid());
