"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadProfilePhoto, deleteProfilePhoto } from "@/actions/photo";
import { ROUTES } from "@/lib/constants/routes";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/motion/PageTransition";

const MAX_PHOTOS = 5;
const MIN_PHOTOS = 2;

export default function PhotosStep() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("onboarding") || "{}");
    if (saved.photo_urls?.length) {
      setPhotos(saved.photo_urls);
    }
  }, []);

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
        setPhotos((prev) => {
          const updated = [...prev, result.url!];
          const existing = JSON.parse(
            sessionStorage.getItem("onboarding") || "{}"
          );
          sessionStorage.setItem(
            "onboarding",
            JSON.stringify({ ...existing, photo_urls: updated })
          );
          return updated;
        });
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (index: number) => {
    const url = photos[index];
    const result = await deleteProfilePhoto(url);
    if (result.error) {
      setError(result.error);
      return;
    }

    setPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      const existing = JSON.parse(
        sessionStorage.getItem("onboarding") || "{}"
      );
      sessionStorage.setItem(
        "onboarding",
        JSON.stringify({ ...existing, photo_urls: updated })
      );
      return updated;
    });
  };

  const handleNext = () => {
    if (photos.length < MIN_PHOTOS) {
      setError(`최소 ${MIN_PHOTOS}장의 사진을 등록해주세요`);
      return;
    }

    const existing = JSON.parse(sessionStorage.getItem("onboarding") || "{}");
    sessionStorage.setItem(
      "onboarding",
      JSON.stringify({ ...existing, photo_urls: photos })
    );
    router.push(ROUTES.ONBOARDING.OCCUPATION);
  };

  return (
    <PageTransition>
      <h2 className="mb-2 text-2xl font-bold text-stranger-light">
        프로필 사진을 등록해주세요
      </h2>
      <p className="mb-8 text-sm text-gray-400">
        최소 {MIN_PHOTOS}장, 최대 {MAX_PHOTOS}장까지 등록할 수 있어요
      </p>

      <div className="grid grid-cols-3 gap-3">
        {photos.map((url, index) => (
          <div key={url} className="relative aspect-square">
            <img
              src={url}
              alt={`프로필 사진 ${index + 1}`}
              className="h-full w-full rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

      <p className="mt-4 text-xs text-gray-500">
        매칭 시 상대방에게 사진이 공개됩니다. 본인 사진을 올려주세요.
      </p>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <Button
        onClick={handleNext}
        disabled={photos.length < MIN_PHOTOS || uploading}
        className="mt-6 w-full"
        size="lg"
      >
        다음
      </Button>
    </PageTransition>
  );
}
