"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { PlaceCategory } from "@/lib/constants/places";
import type { PropCategory } from "@/lib/constants/props";
import { localizePropName } from "@/lib/constants/props";
import { localizeAction } from "@/lib/constants/actions";
import DepartureConfirmation from "./DepartureConfirmation";
import MissionMap from "./MissionMap";
import ReportModal from "@/components/safety/ReportModal";

interface MissionCardProps {
  mission: {
    id: number;
    place_name: string;
    place_address: string;
    place_lat: number;
    place_lng: number;
    place_category: string;
    user_a_prop_category: string;
    user_a_prop_name: string;
    user_a_prop_description: string | null;
    user_b_prop_category: string;
    user_b_prop_name: string;
    user_b_prop_description: string | null;
    user_a_action: string | null;
    user_b_action: string | null;
    meeting_date: string;
    meeting_time: string;
    user_a_departure_confirmed: boolean;
    user_b_departure_confirmed: boolean;
    status: string;
    ai_place_rationale?: string | null;
    ai_prop_rationale_a?: string | null;
    ai_prop_rationale_b?: string | null;
  };
  role: "user_a" | "user_b";
  partnerNickname?: string;
  partnerId?: string;
}

export default function MissionCard({ mission, role, partnerNickname, partnerId }: MissionCardProps) {
  const t = useTranslations("mission");
  const tPlace = useTranslations("place_categories");
  const tProp = useTranslations("prop_categories");
  const locale = useLocale();
  const dateLocale = locale === "en" ? "en-US" : locale === "ja" ? "ja-JP" : "ko-KR";
  const placeCategoryLabels: Record<string, string> = {
    cafe: tPlace("cafe"),
    bookstore: tPlace("bookstore"),
    park: tPlace("park"),
    museum: tPlace("museum"),
    library: tPlace("library"),
    mall: tPlace("mall"),
    restaurant: tPlace("restaurant"),
  };
  const propCategoryLabels: Record<string, string> = {
    clothing_color: tProp("clothing_color"),
    phone_screen: tProp("phone_screen"),
    convenience_item: tProp("convenience_item"),
    accessory: tProp("accessory"),
    book_magazine: tProp("book_magazine"),
  };
  const isUserA = role === "user_a";
  const [reportOpen, setReportOpen] = useState(false);
  const myPropCategory = isUserA
    ? mission.user_a_prop_category
    : mission.user_b_prop_category;
  const myPropName = isUserA
    ? mission.user_a_prop_name
    : mission.user_b_prop_name;
  const myPropDesc = isUserA
    ? mission.user_a_prop_description
    : mission.user_b_prop_description;
  const myAction = isUserA
    ? mission.user_a_action
    : mission.user_b_action;
  const myPropRationale = isUserA
    ? mission.ai_prop_rationale_a
    : mission.ai_prop_rationale_b;
  const myConfirmed = isUserA
    ? mission.user_a_departure_confirmed
    : mission.user_b_departure_confirmed;
  const partnerConfirmed = isUserA
    ? mission.user_b_departure_confirmed
    : mission.user_a_departure_confirmed;

  const formattedDate = new Date(mission.meeting_date).toLocaleDateString(
    dateLocale,
    { month: "long", day: "numeric", weekday: "short" }
  );
  const formattedTime = mission.meeting_time.slice(0, 5); // HH:MM

  const localizedPropName = localizePropName(myPropCategory, myPropName, locale);
  const localizedAction = myAction ? localizeAction(myAction, locale) : null;

  return (
    <div className="space-y-4 rounded-2xl bg-stranger-dark p-5">
      {/* 장소 정보 */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-stranger-accent/20 px-2 py-0.5 text-xs text-stranger-accent">
            {placeCategoryLabels[mission.place_category as PlaceCategory] ??
              mission.place_category}
          </span>
        </div>
        <h3 className="text-base font-bold text-stranger-light">
          {mission.place_name}
        </h3>
        <p className="text-xs text-gray-400">{mission.place_address}</p>
        {mission.ai_place_rationale && (
          <p className="mt-1 text-xs text-stranger-accent">
            {mission.ai_place_rationale}
          </p>
        )}
      </div>

      {/* 지도 */}
      <MissionMap
        lat={mission.place_lat}
        lng={mission.place_lng}
        placeName={mission.place_name}
      />

      {/* 일시 */}
      <div className="flex items-center gap-3 rounded-lg bg-stranger-mid px-4 py-3">
        <svg
          className="h-5 w-5 text-stranger-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-stranger-light">
            {formattedDate}
          </p>
          <p className="text-xs text-gray-400">{formattedTime}</p>
        </div>
      </div>

      {/* 상대 닉네임 */}
      {partnerNickname && (
        <div className="rounded-lg bg-stranger-mid px-4 py-3">
          <p className="mb-1 text-xs text-gray-400">{t("partner")}</p>
          <p className="text-sm font-bold text-stranger-accent">{partnerNickname}</p>
        </div>
      )}

      {/* 나의 소품 */}
      <div className="rounded-lg bg-stranger-mid px-4 py-3">
        <p className="mb-1 text-xs text-gray-400">
          {t("your_props")} (
          {propCategoryLabels[myPropCategory as PropCategory] ??
            myPropCategory}
          )
        </p>
        <p className="text-sm font-medium text-stranger-light">{localizedPropName}</p>
        {myPropDesc && (
          <p className="mt-1 text-xs text-gray-400">{myPropDesc}</p>
        )}
        {myPropRationale && (
          <p className="mt-1 text-xs text-stranger-accent">
            {myPropRationale}
          </p>
        )}
      </div>

      {/* 나의 식별 행동 */}
      {localizedAction && (
        <div className="rounded-lg bg-stranger-mid px-4 py-3">
          <p className="mb-1 text-xs text-gray-400">{t("my_action")}</p>
          <p className="text-sm font-medium text-stranger-light">{localizedAction}</p>
        </div>
      )}

      {/* 출발 확인 */}
      {mission.status === "scheduled" && (
        <DepartureConfirmation
          missionId={mission.id}
          meetingDate={mission.meeting_date}
          meetingTime={mission.meeting_time}
          isConfirmed={myConfirmed}
          partnerConfirmed={partnerConfirmed}
        />
      )}

      {/* 신고 */}
      {partnerId && (
        <button
          onClick={() => setReportOpen(true)}
          className="mt-2 w-full text-center text-xs text-gray-600 hover:text-red-400"
        >
          {t("report")}
        </button>
      )}

      {partnerId && (
        <ReportModal
          reportedUserId={partnerId}
          missionId={mission.id}
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}
