-- matches 테이블에 expires_at 컬럼 추가
ALTER TABLE matches ADD COLUMN expires_at TIMESTAMPTZ;

-- 기존 데이터: 생성일로부터 7일 후 만료
UPDATE matches SET expires_at = created_at + INTERVAL '7 days';

-- notifications.type CHECK 제약 업데이트 (match_expired 추가)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('match_new','match_accepted','match_rejected','mission_created','match_expired'));
