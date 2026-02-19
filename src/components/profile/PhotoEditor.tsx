"use client";

import { useRef, useState, useTransition } from "react";
import { uploadProfilePhoto, deleteProfilePhoto } from "@/actions/photo";
import { updateProfile } from "@/actions/profile";

const MAX_PHOTOS = 5;
const MIN_PHOTOS = 2;

interface PhotoEditorProps {
  initialPhotos: string[];
  onSaved: () => void;
  onCancel: () => void;
}

export default function PhotoEditor({
  initialPhotos,
  onSaved,
  onCancel,
}: PhotoEditorProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError("");
    setUploading(true);

    const remaining = MAX_PHOTOS - photos.length;
    const filesToUpload = Array.from(files).slice(0, remaining);

    for (const file of filesToUpload) {
      if (file.size > 5 * 1024 * 1024) {
        setError("파일 크기는 5MB 이하여야 합니다");
        continue;
      }
      if (!file.type.startsWith("image/")) {
        setError("이미지 파일만 업로드할 수 있습니다");
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadProfilePhoto(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        setPhotos((prev) => [...prev, result.url!]);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = async (index: number) => {
    const url = photos[index];
    const result = await deleteProfilePhoto(url);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (photos.length < MIN_PHOTOS) {
      setError(`최소 ${MIN_PHOTOS}장의 사진이 필요합니다`);
      return;
    }
    startTransition(async () => {
      const result = await updateProfile({ photo_urls: photos });
      if (result.error) {
        setError(result.error);
      } else {
        onSaved();
      }
    });
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {photos.map((url, index) => (
          <div key={url} className="relative aspect-square">
            <img
              src={url}
              alt={`사진 ${index + 1}`}
              className="h-full w-full rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-stranger-accent/90 px-1.5 py-0.5 text-[10px] text-white">
                대표
              </span>
            )}
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 transition-colors hover:border-stranger-accent">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-stranger-accent border-t-transparent" />
            ) : (
              <>
                <svg
                  className="h-8 w-8 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span className="mt-1 text-xs text-gray-500">
                  {photos.length}/{MAX_PHOTOS}
                </span>
              </>
            )}
          </label>
        )}
      </div>

      <p className="text-xs text-gray-500">
        최소 {MIN_PHOTOS}장 · 최대 {MAX_PHOTOS}장 · 첫 번째 사진이 대표 사진입니다
      </p>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border border-gray-600 py-2.5 text-sm text-gray-400"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={isPending || uploading || photos.length < MIN_PHOTOS}
          className="flex-1 rounded-xl bg-stranger-accent py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
}
