-- ==============================================
-- 매칭/미션 동작에 필요한 누락된 RLS 정책 추가
-- ==============================================

-- 1) matches: INSERT (매칭 당사자가 포함된 경우)
CREATE POLICY "Users can create matches as participant"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- 2) matches: UPDATE (매칭 당사자만 수락/거절 가능)
CREATE POLICY "Users can update own matches"
  ON matches FOR UPDATE
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id)
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- 3) missions: INSERT (매칭 당사자가 미션 생성)
CREATE POLICY "Users can create missions for own matches"
  ON missions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

-- 4) no_show_checks: INSERT (매칭 당사자가 미션의 노쇼체크 생성)
CREATE POLICY "Users can create no_show_checks for own missions"
  ON no_show_checks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM missions
      JOIN matches ON matches.id = missions.match_id
      WHERE missions.id = mission_id
        AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

-- 5) user_answers: 인증된 사용자 모두 읽기 가능 (매칭 점수 계산에 필요)
--    기존 정책: 본인 답변만 읽기 → 상대 답변 비교 불가
DROP POLICY IF EXISTS "Users can read own answers" ON user_answers;

CREATE POLICY "Authenticated users can read answers"
  ON user_answers FOR SELECT
  USING (auth.role() = 'authenticated');
