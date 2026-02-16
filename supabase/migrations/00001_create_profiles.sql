-- profiles: 사용자 프로필 정보
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  birth_year INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  occupation TEXT NOT NULL,
  mbti TEXT CHECK (mbti IN (
    'ISTJ','ISFJ','INFJ','INTJ',
    'ISTP','ISFP','INFP','INTP',
    'ESTP','ESFP','ENFP','ENTP',
    'ESTJ','ESFJ','ENFJ','ENTJ'
  )),
  activity_area TEXT NOT NULL,
  activity_lat DOUBLE PRECISION NOT NULL,
  activity_lng DOUBLE PRECISION NOT NULL,
  preferred_gender TEXT NOT NULL CHECK (preferred_gender IN ('male', 'female', 'any')),
  preferred_age_min INTEGER NOT NULL DEFAULT 19,
  preferred_age_max INTEGER NOT NULL DEFAULT 100,
  preferred_distance_km INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'banned')),
  no_show_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 프로필 업데이트 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
