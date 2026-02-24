"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "@/actions/auth";
import { updateProfile } from "@/actions/profile";
import { ROUTES } from "@/lib/constants/routes";
import { MBTI_TYPES } from "@/lib/constants/mbti";
import { REGIONS, findArea } from "@/lib/constants/areas";
import { HOBBIES } from "@/lib/constants/hobbies";
import { PERSONALITIES } from "@/lib/constants/personality";
import { IDEAL_TYPES } from "@/lib/constants/ideal-type";
import Image from "next/image";
import PhotoEditor from "@/components/profile/PhotoEditor";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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

interface SettingsClientProps {
  profile: Profile;
}

export default function SettingsClient({ profile }: SettingsClientProps) {
  const t = useTranslations("settings");
  const gt = useTranslations("gender");
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [matchingStatus, setMatchingStatus] = useState(profile.status);
  const [statusPending, startStatusTransition] = useTransition();
  const [isPhotoEditing, setIsPhotoEditing] = useState(false);
  const [currentPhotos] = useState(profile.photo_urls ?? []);

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
        setSaveMessage(t("save_success"));
        setIsEditing(false);
        router.refresh();
      }
    });
  };

  if (isEditing) {
    return (
      <div className="px-4 pb-24 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stranger-light">{t("edit_title")}</h1>
          <button
            onClick={handleCancelEdit}
            className="text-sm text-gray-400"
          >
            {t("logout_cancel")}
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {/* 닉네임 */}
          <div>
            <label className="mb-1.5 block text-xs text-gray-400">{t("nickname_label")}</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder={t("nickname_placeholder")}
              className="w-full rounded-xl bg-stranger-mid px-4 py-3 text-sm text-stranger-light outline-none focus:ring-1 focus:ring-stranger-accent"
            />
          </div>

          {/* 직업 */}
          <div>
            <label className="mb-1.5 block text-xs text-gray-400">{t("occupation_label")}</label>
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
            <label className="mb-1.5 block text-xs text-gray-400">{t("mbti_label")}</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setMbti("")}
                className={`rounded-lg py-2 text-xs transition-colors ${
                  mbti === ""
                    ? "bg-stranger-accent text-white"
                    : "bg-stranger-mid text-gray-400"
                }`}
              >
                {t("mbti_unset")}
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
            label={t("hobbies_label")}
            subtitle={t("max_count")}
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
            label={t("personality_label")}
            subtitle={t("max_count")}
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
            label={t("ideal_type_label")}
            subtitle={t("max_count")}
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
              {t("activity_area_label")}
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
              {t("matching_preferences")}
            </h2>

            {/* 선호 성별 */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs text-gray-400">
                {t("preferred_gender_label")}
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
                    {gt(g)}
                  </button>
                ))}
              </div>
            </div>

            {/* 선호 나이 */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs text-gray-400">
                {t("preferred_age_label", { min: preferredAgeMin, max: preferredAgeMax })}
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
                {t("preferred_distance_label", { km: preferredDistanceKm })}
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
            {isPending ? t("saving") : t("save_btn")}
          </button>

          {saveMessage && (
            <p
              className={`text-center text-sm ${
                saveMessage === t("save_success") ? "text-green-400" : "text-red-400"
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
      <h1 className="text-2xl font-bold text-stranger-light">{t("title")}</h1>
      <p className="mt-1 text-sm text-gray-400">{t("subtitle")}</p>

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
                {profile.occupation} · {profile.mbti ?? t("mbti_not_set")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-stranger-dark px-3 py-1.5 text-xs text-stranger-accent"
          >
            {t("edit_title")}
          </button>
        </div>

        {/* 사진 미리보기 */}
        {currentPhotos.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {currentPhotos.map((url, i) => (
              <div key={url} className="relative h-16 w-16 shrink-0">
                <Image
                  src={url}
                  alt={`사진 ${i + 1}`}
                  fill
                  className="rounded-lg object-cover"
                />
                {i === 0 && (
                  <span className="absolute bottom-0.5 left-0.5 rounded bg-stranger-accent/90 px-1 py-0.5 text-[8px] text-white">
                    {t("photo_representative")}
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
            {t("photo_manage", { current: currentPhotos.length, max: 5 })}
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
          <InfoRow label={t("info_nickname")} value={profile.nickname} />
          <InfoRow label={t("info_phone")} value={formatPhone(profile.phone)} />
          <InfoRow label={t("info_gender")} value={gt(profile.gender)} />
          <InfoRow label={t("info_birth_year")} value={t("info_birth_year_value", { year: profile.birth_year })} />
          <InfoRow label={t("info_occupation")} value={profile.occupation} />
          <InfoRow label={t("info_mbti")} value={profile.mbti ?? t("info_mbti_unset")} />
          <InfoRow label={t("info_area")} value={profile.activity_area} />
          <TagRow label={t("info_hobbies")} tags={profile.hobbies} color="text-stranger-accent" bgColor="bg-stranger-accent/15" />
          <TagRow label={t("info_personality")} tags={profile.personality} color="text-purple-400" bgColor="bg-purple-500/15" />
          <TagRow label={t("info_ideal_type")} tags={profile.ideal_type} color="text-pink-400" bgColor="bg-pink-500/15" />
        </div>
      </div>

      {/* 매칭 선호 */}
      <div className="mt-4 rounded-2xl bg-stranger-mid p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-stranger-light">
            {t("matching_preferences")}
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-stranger-accent"
          >
            {t("edit_title")}
          </button>
        </div>
        <div className="space-y-3">
          <InfoRow
            label={t("preferred_gender_value")}
            value={gt(profile.preferred_gender)}
          />
          <InfoRow
            label={t("info_nickname")}
            value={t("preferred_age_value", { min: profile.preferred_age_min, max: profile.preferred_age_max })}
          />
          <InfoRow
            label={t("preferred_gender_value")}
            value={t("preferred_distance_value", { km: profile.preferred_distance_km })}
          />
        </div>
      </div>

      {/* 매칭 상태 */}
      <div className="mt-4 rounded-2xl bg-stranger-mid p-5">
        <h2 className="mb-3 text-sm font-bold text-stranger-light">{t("matching_section")}</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stranger-light">{t("matching_active")}</p>
            <p className="text-xs text-gray-400">
              {matchingStatus === "active"
                ? t("matching_active_desc")
                : matchingStatus === "paused"
                  ? t("matching_paused_desc")
                  : t("matching_banned_desc")}
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
          {t("account_section")}
        </h2>
        <div className="space-y-3">
          <InfoRow
            label={t("account_status")}
            value={
              matchingStatus === "active"
                ? t("account_active")
                : matchingStatus === "paused"
                  ? t("account_paused")
                  : t("account_banned")
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
            label={t("no_show_count")}
            value={t("no_show_value", { count: profile.no_show_count })}
            valueColor={
              profile.no_show_count >= 2 ? "text-yellow-400" : undefined
            }
          />
          <InfoRow label={t("join_date")} value={joinDate} />
        </div>
      </div>

      {/* 언어 설정 */}
      <div className="mt-4 rounded-2xl bg-stranger-mid p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stranger-light">{t("language_label")}</h2>
          <LanguageSwitcher />
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="mt-6">
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full rounded-xl border border-gray-600 py-3 text-sm text-gray-400 transition-colors hover:border-red-500 hover:text-red-400"
          >
            {t("logout")}
          </button>
        ) : (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <p className="mb-3 text-center text-sm text-stranger-light">
              {t("logout_confirm")}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-lg border border-gray-600 py-2.5 text-sm text-gray-400"
              >
                {t("logout_cancel")}
              </button>
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {isPending ? t("logout_processing") : t("logout")}
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
