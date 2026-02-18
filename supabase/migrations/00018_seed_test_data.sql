-- ============================================
-- 테스트 데이터 시드 마이그레이션
-- 기존 테스트 계정(01012345678, 01098765432)에
-- 프로필 사진 + 알림 데이터 추가
-- (매칭/미션은 이미 존재하므로 기존 데이터 활용)
-- ============================================

DO $$
DECLARE
  v_user_a UUID;
  v_user_b UUID;
  v_match_id INTEGER;
  v_mission_id INTEGER;
BEGIN
  -- 기존 테스트 계정 조회
  SELECT id INTO v_user_a FROM profiles WHERE phone = '01012345678';
  SELECT id INTO v_user_b FROM profiles WHERE phone = '01098765432';

  IF v_user_a IS NULL OR v_user_b IS NULL THEN
    RAISE NOTICE '테스트 계정을 찾을 수 없습니다. phone=01012345678 또는 01098765432 확인 필요';
    RETURN;
  END IF;

  -- 기존 매칭/미션 조회 (없으면 NULL)
  SELECT id INTO v_match_id FROM matches
    WHERE (user_a_id = v_user_a AND user_b_id = v_user_b)
       OR (user_a_id = v_user_b AND user_b_id = v_user_a)
    LIMIT 1;

  IF v_match_id IS NOT NULL THEN
    SELECT id INTO v_mission_id FROM missions WHERE match_id = v_match_id LIMIT 1;
  END IF;

  -- -----------------------------------------------
  -- 1) 프로필 사진 URL 업데이트 (picsum placeholder)
  -- -----------------------------------------------
  UPDATE profiles SET photo_urls = ARRAY[
    'https://picsum.photos/id/1005/400/500',
    'https://picsum.photos/id/1012/400/500',
    'https://picsum.photos/id/1025/400/500'
  ]
  WHERE id = v_user_a;

  UPDATE profiles SET photo_urls = ARRAY[
    'https://picsum.photos/id/1011/400/500',
    'https://picsum.photos/id/1027/400/500',
    'https://picsum.photos/id/1035/400/500',
    'https://picsum.photos/id/1039/400/500'
  ]
  WHERE id = v_user_b;

  -- -----------------------------------------------
  -- 2) 알림 데이터 — 01012345678 사용자
  -- -----------------------------------------------
  INSERT INTO notifications (user_id, type, title, body, related_match_id, related_mission_id, is_read, created_at) VALUES
  (v_user_a, 'match_new',
   '새로운 매칭이 도착했어요!',
   '호환도 85%의 새로운 상대가 나타났습니다. 프로필을 확인해보세요.',
   v_match_id, NULL, true,
   now() - interval '2 days'),
  (v_user_a, 'match_accepted',
   '매칭이 성사되었습니다!',
   '상대방도 수락하여 매칭이 성사되었습니다. 미션을 확인해보세요!',
   v_match_id, NULL, true,
   now() - interval '1 day 12 hours'),
  (v_user_a, 'mission_created',
   '만남 미션이 생성되었어요!',
   '스타벅스 강남역점에서 만남이 예정되어 있습니다. 미션 상세를 확인해보세요.',
   v_match_id, v_mission_id, true,
   now() - interval '1 day'),
  (v_user_a, 'match_new',
   '새로운 매칭이 도착했어요!',
   '호환도 78%의 새로운 상대가 매칭되었습니다.',
   NULL, NULL, false,
   now() - interval '3 hours'),
  (v_user_a, 'match_new',
   '새로운 매칭 알림',
   '당신과 잘 맞는 새로운 상대를 찾았어요!',
   NULL, NULL, false,
   now() - interval '30 minutes');

  -- -----------------------------------------------
  -- 3) 알림 데이터 — 01098765432 사용자
  -- -----------------------------------------------
  INSERT INTO notifications (user_id, type, title, body, related_match_id, related_mission_id, is_read, created_at) VALUES
  (v_user_b, 'match_new',
   '새로운 매칭이 도착했어요!',
   '호환도 85%의 새로운 상대가 나타났습니다. 프로필을 확인해보세요.',
   v_match_id, NULL, true,
   now() - interval '2 days'),
  (v_user_b, 'match_accepted',
   '매칭이 성사되었습니다!',
   '상대방도 수락하여 매칭이 성사되었습니다. 미션을 확인해보세요!',
   v_match_id, NULL, true,
   now() - interval '1 day 12 hours'),
  (v_user_b, 'mission_created',
   '만남 미션이 생성되었어요!',
   '스타벅스 강남역점에서 만남이 예정되어 있습니다. 미션 상세를 확인해보세요.',
   v_match_id, v_mission_id, false,
   now() - interval '1 day'),
  (v_user_b, 'match_rejected',
   '매칭이 성사되지 않았어요',
   '아쉽지만 상대방이 이번 매칭을 거절했습니다. 새로운 매칭을 기다려주세요.',
   NULL, NULL, false,
   now() - interval '5 hours'),
  (v_user_b, 'match_new',
   '새로운 매칭 알림',
   '당신과 잘 맞는 새로운 상대를 찾았어요! 프로필을 확인해보세요.',
   NULL, NULL, false,
   now() - interval '1 hour');

  RAISE NOTICE '테스트 데이터 삽입 완료 — user_a: %, user_b: %, match: %, mission: %',
    v_user_a, v_user_b, v_match_id, v_mission_id;
END $$;
