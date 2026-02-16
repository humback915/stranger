ALTER TABLE profiles ADD COLUMN nickname TEXT NOT NULL DEFAULT '';
ALTER TABLE missions ADD COLUMN user_a_action TEXT;
ALTER TABLE missions ADD COLUMN user_b_action TEXT;
