-- 관리자 역할 추가
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
