-- 양쪽 수락 여부 컬럼 추가 (null=미응답, true=수락, false=거절)
ALTER TABLE matches
  ADD COLUMN user_a_accepted BOOLEAN DEFAULT NULL,
  ADD COLUMN user_b_accepted BOOLEAN DEFAULT NULL;
