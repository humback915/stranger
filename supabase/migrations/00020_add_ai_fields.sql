-- AI 연동 필드 추가
ALTER TABLE matches ADD COLUMN ai_description TEXT;
ALTER TABLE missions ADD COLUMN ai_place_rationale TEXT;
ALTER TABLE missions ADD COLUMN ai_prop_rationale_a TEXT;
ALTER TABLE missions ADD COLUMN ai_prop_rationale_b TEXT;
