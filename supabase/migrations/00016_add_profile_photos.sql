-- 프로필에 사진 URL 배열 필드 추가 (최소 2장, 최대 5장)
ALTER TABLE profiles
  ADD COLUMN photo_urls TEXT[] DEFAULT '{}';

-- Supabase Storage 버킷 생성 (이미 존재하면 무시)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 인증된 사용자만 자기 폴더에 업로드 가능
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 인증된 사용자만 자기 사진 삭제 가능
CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 모든 사용자가 프로필 사진 조회 가능 (공개)
CREATE POLICY "Anyone can view profile photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-photos');
