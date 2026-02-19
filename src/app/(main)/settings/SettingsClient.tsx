"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/actions/auth";
import { updateProfile } from "@/actions/profile";
import { ROUTES } from "@/lib/constants/routes";
import { MBTI_TYPES } from "@/lib/constants/mbti";
import { REGIONS, findArea } from "@/lib/constants/areas";
import { HOBBIES } from "@/lib/constants/hobbies";
import { PERSONALITIES } from "@/lib/constants/personality";
import { IDEAL_TYPES } from "@/lib/constants/ideal-type";
import PhotoEditor from "@/components/profile/PhotoEditor";

interface Profile {
  id: string;
  phone: string;
  nickname: string;
  birth_year: number;
  photo_urls: string[];
  gender: "male" | "female";
  occupation: string;
  mbti: string | null;
  hobbies: string[];
  personality: string[];
  ideal_type: string[];
  activity_area: string;
  preferred_gender: "male" | "female" | "any";
  preferred_age_min: number;
  preferred_age_max: number;
  preferred_distance_km: number;
  status: "active" | "paused" | "banned";
  no_show_count: number;
  created_at: string;
}

const GENDER_LABELS: Record<string, string> = {
  male: "남성",
  female: "여성",
  any: "무관",
};

interface SettingsClientProps {
  profile: Profile;
}

export default function SettingsClient({ profile }: SettingsClientProps) {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [matchingStatus, setMatchingStatus] = useState(profile.status);
  const [statusPending, startStatusTransition] = useTransition();
  const [isPhotoEditing, setIsPhotoEditing] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState(profile.photo_urls ?? []);

  // 수정 가능한 필드 상태
  const [nickname, setNickname] = useState(profile.nickname);
  const [occupation, setOccupation] = useState(profile.occupation);
  const [mbti, setMbti] = useState(profile.mbti ?? "");
  const [hobbies, setHobbies] = useState<string[]>(profile.hobbies ?? []);
  const [personality, setPersonality] = useState<string[]>(profile.personality ?? []);
  const [idealType, setIdealType] = useState<string[]>(profile.ideal_type ?? []);
  const [activityArea, setActivityArea] = useState(profile.activity_area);
  const [preferredGender, setPreferredGender] = useState(profile.preferred_gender);
  const [preferredAgeMin, setPreferredAgeMin] = useState(profile.preferred_age_min);
  const [preferredAgeMax, setPreferredAgeMax] = useState(profile.preferred_age_max);
  const [preferredDistanceKm, setPreferredDistanceKm] = useState(profile.preferred_distance_km);
  const [saveMessage, setSaveMessage] = useState("");

  const currentYear = new Date().getFullYear();
  const age = currentYear - profile.birth_year;

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("82")) {
      const local = "0" + cleaned.slice(2);
      return local.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    }
    return phone;
  };

  const joinDate = new Date(profile.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleToggleMatchingStatus = () => {
    if (matchingStatus === "banned") return;
    const next = matchingStatus === "active" ? "paused" : "active";
    startStatusTransition(async () => {
      const result = await updateProfile({ status: next });
      if (!result.error) setMatchingStatus(next);
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await signOut();
      router.push(ROUTES.LOGIN);
    });
  };

  const handleCancelEdit = () => {
    setNickname(profile.nickname);
    setOccupation(profile.occupation);
    setMbti(profile.mbti ?? "");
    setHobbies(profile.hobbies ?? []);
    setPersonality(profile.personality ?? []);
    setIdealType(profile.ideal_type ?? []);
    setActivityArea(profile.activity_area);
    setPreferredGender(profile.preferred_gender);
    setPreferredAgeMin(profile.preferred_age_min);
    setPreferredAgeMax(profile.preferred_age_max);
    setPreferredDistanceKm(profile.preferred_distance_km);
    setSaveMessage("");
    setIsEditing(false);
  };

  const handleSave = () => {
    setSaveMessage("");
    startTransition(async () => {
      const area = findArea(activityArea);
      const result = await updateProfile({
        nickname,
        occupation,
        mbti: mbti || null,
        hobbies,
        personality,
        ideal_type: idealType,
        activity_area: activityArea,
        activity_lat: area?.lat,
        activity_lng: area?.lng,
        preferred_gender: preferredGender,
        preferred_age_min: preferredAgeMin,
        preferred_age_max: preferredAgeMax,
        preferred_distance_km: preferredDistanceKm,
      });

      if (result.error) {
        setSaveMessage(result.error);
      } else {
        setSaveMessage("저장되었습니다");
        setIsEditing(false);
        router.refresh();
      }
    });
  };

  if (isEditing) {
    return (
      <div className="px-4 pb-24 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stranger-light">프로필 수정</h1>
          <button
            onClick={handleCancelEdit}
            className="text-sm text-gray-400"
          >
            취소
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {/* 닉네임 */}
          <div>
            <label className="mb-1.5 block text-xs text-gray-400">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="닉네임을 입력하세요"
              className="w-full rounded-xl bg-stranger-mid px-4 py-3 text-sm text-stranger-light outline-none focus:ring-1 focus:ring-stranger-accent"
            />
          </div>

          {/* 직업 */}
          <div>
            <label className="mb-1.5 block text-xs text-gray-400">직업</label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              maxLength={50}
              className="w-full rounded-xl bg-stranger-mid px-4 py-3 text-sm text-stranger-light outline-none focus:ring-1 focus:ring-stranger-accent"
            />
          </div>

          {/* MBTI */}
          <div>
            <label className="mb-1.5 block text-xs text-gray-400">MBTI</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setMbti("")}
                className={`rounded-lg py-2 text-xs transition-colors ${
                  mbti === ""
                    ? "bg-stranger-accent text-white"
                    : "bg-stranger-mid text-gray-400"
                }`}
              >
                미설정
              </button>
              {MBTI_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setMbti(type)}
                  className={`rounded-lg py-2 text-xs transition-colors ${
                    mbti === type
                      ? "bg-stranger-accent text-white"
                      : "bg-stranger-mid text-gray-400"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 취미 */}
          <TagEditor
            label="취미"
            subtitle="최대 5개"
            items={HOBBIES}
            selected={hobbies}
            onToggle={(item) =>
              setHobbies((prev) =>
                prev.includes(item)
                  ? prev.filter((v) => v !== item)
                  : prev.length < 5
                    ? [...prev, item]
                    : prev
              )
            }
            activeColor="bg-stranger-accent text-white"
          />

          {/* 성격 */}
          <TagEditor
            label="성격"
            subtitle="최대 5개"
            items={PERSONALITIES}
            selected={personality}
            onToggle={(item) =>
              setPersonality((prev) =>
                prev.includes(item)
                  ? prev.filter((v) => v !== item)
                  : prev.length < 5
                    ? [...prev, item]
                    : prev
              )
            }
            activeColor="bg-purple-500 text-white"
          />

          {/* 이상형 */}
          <TagEditor
            label="이상형"
            subtitle="최대 5개"
            items={IDEAL_TYPES}
            selected={idealType}
            onToggle={(item) =>
              setIdealType((prev) =>
                prev.includes(item)
                  ? prev.filter((v) => v !== item)
                  : prev.length < 5
                    ? [...prev, item]
                    : prev
              )
            }
            activeColor="bg-pink-500 text-white"
          />

          {/* 활동 지역 */}
          <div>
            <label className="mb-1.5 block text-xs text-gray-400">
              활동 지역
            </label>
            <select
              value={activityArea}
              onChange={(e) => setActivityArea(e.target.value)}
              className="w-full rounded-xl bg-stranger-mid px-4 py-3 text-sm text-stranger-light outline-none focus:ring-1 focus:ring-stranger-accent"
            >
              {REGIONS.map((region) => (
                <optgroup key={region.name} label={region.name}>
                  {region.areas.map((area) => (
                    <option key={area.name} value={area.name}>
                      {area.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* 매칭 선호 설정 */}
          <div className="rounded-2xl bg-stranger-mid p-5">
            <h2 className="mb-4 text-sm font-bold text-stranger-light">
              매칭 선호 설정
            </h2>

            {/* 선호 성별 */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs text-gray-400">
                선호 성별
              </label>
              <div className="flex gap-2">
                {(["any", "male", "female"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setPreferredGender(g)}
                    className={`flex-1 rounded-lg py-2.5 text-sm transition-colors ${
                      preferredGender === g
                        ? "bg-stranger-accent text-white"
                        : "bg-stranger-dark text-gray-400"
                    }`}
                  >
                    {GENDER_LABELS[g]}
                  </button>
                ))}
              </div>
            </div>

            {/* 선호 나이 */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs text-gray-400">
                선호 나이: {preferredAgeMin}세 ~ {preferredAgeMax}세
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={19}
                  max={preferredAgeMax}
                  value={preferredAgeMin}
                  onChange={(e) => setPreferredAgeMin(Number(e.target.value))}
                  className="flex-1 accent-stranger-accent"
                />
                <span className="text-xs text-gray-400">~</span>
                <input
                  type="range"
                  min={preferredAgeMin}
                  max={100}
                  value={preferredAgeMax}
                  onChange={(e) => setPreferredAgeMax(Number(e.target.value))}
                  className="flex-1 accent-stranger-accent"
                />
              </div>
            </div>

            {/* 선호 거리 */}
            <div>
              <label className="mb-1.5 block text-xs text-gray-400">
                선호 거리: {preferredDistanceKm}km 이내
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={preferredDistanceKm}
                onChange={(e) => setPreferredDistanceKm(Number(e.target.value))}
                className="w-full accent-stranger-accent"
              />
              <div className="mt-1 flex justify-between text-[10px] text-gray-500">
                <span>1km</span>
                <span>50km</span>
                <span>100km</span>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={isPending || !nickname.trim() || !occupation.trim()}
            className="w-full rounded-xl bg-stranger-accent py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
          >
            {isPending ? "저장 중..." : "저장하기"}
          </button>

          {saveMessage && (
            <p
              className={`text-center text-sm ${
                saveMessage.includes("저장") ? "text-green-400" : "text-red-400"
              }`}
            >
              {saveMessage}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 pt-6">
      <h1 className="text-2xl font-bold text-stranger-light">설정</h1>
      <p className="mt-1 text-sm text-gray-400">프로필 및 앱 설정을 관리하세요</p>

      {saveMessage && (
        <div className="mt-3 rounded-lg bg-green-600/10 px-4 py-2.5 text-sm text-green-400">
          {saveMessage}
        </div>
      )}

      {/* 프로필 카드 */}
      <div className="mt-6 rounded-2xl bg-stranger-mid p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stranger-dark text-2xl">
              {profile.gender === "male" ? "👨" : "👩"}
            </div>
            <div>
              <p className="text-base font-bold text-stranger-light">
                {profile.nickname} · {age}세
              </p>
              <p className="text-xs text-gray-400">
                {profile.occupation} · {profile.mbti ?? "MBTI 미설정"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-stranger-dark px-3 py-1.5 text-xs text-stranger-accent"
          >
            수정
          </button>
        </div>

        {/* 사진 미리보기 */}
        {currentPhotos.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {currentPhotos.map((url, i) => (
              <div key={url} className="relative h-16 w-16 shrink-0">
                <img
                  src={url}
                  alt={`사진 ${i + 1}`}
                  className="h-full w-full rounded-lg object-cover"
                />
                {i === 0 && (
                  <span className="absolute bottom-0.5 left-0.5 rounded bg-stranger-accent/90 px-1 py-0.5 text-[8px] text-white">
                    대표
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 사진 관리 버튼 */}
        {!isPhotoEditing ? (
          <button
            onClick={() => setIsPhotoEditing(true)}
            className="mb-3 w-full rounded-lg border border-dashed border-gray-600 py-2 text-xs text-gray-400 hover:border-stranger-accent hover:text-stranger-accent"
          >
            사진 관리 ({currentPhotos.length}/{5})
          </button>
        ) : (
          <PhotoEditor
            initialPhotos={currentPhotos}
            onSaved={() => {
              setIsPhotoEditing(false);
              router.refresh();
            }}
            onCancel={() => setIsPhotoEditing(false)}
          />
        )}

        <div className="space-y-3">
          <InfoRow label="닉네임" value={profile.nickname} />
          <InfoRow label="전화번호" value={formatPhone(profile.phone)} />
          <InfoRow label="성별" value={GENDER_LABELS[profile.gender]} />
          <InfoRow label="출생연도" value={`${profile.birth_year}년`} />
          <InfoRow label="직업" value={profile.occupation} />
          <InfoRow label="MBTI" value={profile.mbti ?? "미설정"} />
          <InfoRow label="활동 지역" value={profile.activity_area} />
          <TagRow label="취미" tags={profile.hobbies} color="text-stranger-accent" bgColor="bg-stranger-accent/15" />
          <TagRow label="성격" tags={profile.personality} color="text-purple-400" bgColor="bg-purple-500/15" />
          <TagRow label="이상형" tags={profile.ideal_type} color="text-pink-400" bgColor="bg-pink-500/15" />
        </div>
      </div>

      {/* 매칭 선호 */}
      <div className="mt-4 rounded-2xl bg-stranger-mid p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-stranger-light">
            매칭 선호 설정
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-stranger-accent"
          >
            수정
          </button>
        </div>
        <div className="space-y-3">
          <InfoRow
            label="선호 성별"
            value={GENDER_LABELS[profile.preferred_gender]}
          />
          <InfoRow
            label="선호 나이"
            value={`${profile.preferred_age_min}세 ~ ${profile.preferred_age_max}세`}
          />
          <InfoRow
            label="선호 거리"
            value={`${profile.preferred_distance_km}km 이내`}
          />
        </div>
      </div>

      {/* 매칭 상태 */}
      <div className="mt-4 rounded-2xl bg-stranger-mid p-5">
        <h2 className="mb-3 text-sm font-bold text-stranger-light">매칭 설정</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stranger-light">매칭 활성화</p>
            <p className="text-xs text-gray-400">
              {matchingStatus === "active"
                ? "현재 매칭 상대를 찾고 있습니다"
                : matchingStatus === "paused"
                  ? "매칭이 일시정지 상태입니다"
                  : "계정이 정지되어 매칭할 수 없습니다"}
            </p>
          </div>
          <button
            onClick={handleToggleMatchingStatus}
            disabled={statusPending || matchingStatus === "banned"}
            className={`relative h-7 w-12 rounded-full transition-colors disabled:opacity-50 ${
              matchingStatus === "active" ? "bg-stranger-accent" : "bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                matchingStatus === "active" ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* 계정 상태 */}
      <div className="mt-4 rounded-2xl bg-stranger-mid p-5">
        <h2 className="mb-3 text-sm font-bold text-stranger-light">
          계정 정보
        </h2>
        <div className="space-y-3">
          <InfoRow
            label="계정 상태"
            value={
              matchingStatus === "active"
                ? "활성"
                : matchingStatus === "paused"
                  ? "일시정지"
                  : "정지됨"
            }
            valueColor={
              matchingStatus === "active"
                ? "text-green-400"
                : matchingStatus === "banned"
                  ? "text-red-400"
                  : undefined
            }
          />
          <InfoRow
            label="노쇼 횟수"
            value={`${profile.no_show_count}회`}
            valueColor={
              profile.no_show_count >= 2 ? "text-yellow-400" : undefined
            }
          />
          <InfoRow label="가입일" value={joinDate} />
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="mt-6">
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full rounded-xl border border-gray-600 py-3 text-sm text-gray-400 transition-colors hover:border-red-500 hover:text-red-400"
          >
            로그아웃
          </button>
        ) : (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <p className="mb-3 text-center text-sm text-stranger-light">
              정말 로그아웃하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-lg border border-gray-600 py-2.5 text-sm text-gray-400"
              >
                취소
              </button>
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {isPending ? "로그아웃 중..." : "로그아웃"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm ${valueColor ?? "text-stranger-light"}`}>
        {value}
      </span>
    </div>
  );
}

function TagRow({
  label,
  tags,
  color,
  bgColor,
}: {
  label: string;
  tags: string[];
  color: string;
  bgColor: string;
}) {
  if (!tags || tags.length === 0) return null;
  return (
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-md px-2 py-0.5 text-[10px] ${bgColor} ${color}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function TagEditor({
  label,
  subtitle,
  items,
  selected,
  onToggle,
  activeColor,
}: {
  label: string;
  subtitle: string;
  items: readonly string[];
  selected: string[];
  onToggle: (item: string) => void;
  activeColor: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-gray-400">
        {label} ({selected.length}/5, {subtitle})
      </label>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
              selected.includes(item)
                ? activeColor
                : "bg-stranger-mid text-gray-400"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
