-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE no_show_checks ENABLE ROW LEVEL SECURITY;

-- profiles: 본인 프로필 읽기/수정
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- questions: 활성 질문은 인증된 사용자 모두 읽기 가능
CREATE POLICY "Authenticated users can read active questions"
  ON questions FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- user_answers: 본인 답변만 CRUD
CREATE POLICY "Users can read own answers"
  ON user_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON user_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own answers"
  ON user_answers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- matches: 매칭 당사자만 읽기 가능
CREATE POLICY "Users can read own matches"
  ON matches FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- missions: 매칭 당사자만 읽기/수정 가능
CREATE POLICY "Users can read own missions"
  ON missions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = missions.match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

CREATE POLICY "Users can update own missions"
  ON missions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = missions.match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

-- safety_reports: 본인이 신고한 것만 읽기, 인증된 사용자 신고 가능
CREATE POLICY "Users can read own reports"
  ON safety_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON safety_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- no_show_checks: 본인 것만 읽기/수정
CREATE POLICY "Users can read own no_show_checks"
  ON no_show_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own no_show_checks"
  ON no_show_checks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
