-- 기존 profiles SELECT 정책 삭제 후 재생성
-- 기존: 본인 프로필만 읽기 가능 → 매칭/미들웨어에서 문제 발생
-- 변경: 인증된 사용자는 모든 프로필 읽기 가능 (매칭, 미션 등에 필요)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

CREATE POLICY "Authenticated users can read profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');
