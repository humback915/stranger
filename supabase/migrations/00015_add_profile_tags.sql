-- 프로필에 취미/성격/이상형 태그 필드 추가
ALTER TABLE profiles
  ADD COLUMN hobbies TEXT[] DEFAULT '{}',
  ADD COLUMN personality TEXT[] DEFAULT '{}',
  ADD COLUMN ideal_type TEXT[] DEFAULT '{}';
