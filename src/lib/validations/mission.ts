import { z } from "zod";
import { PLACE_CATEGORIES } from "@/lib/constants/places";
import { PROP_CATEGORIES, PROP_OPTIONS, type PropCategory } from "@/lib/constants/props";

export const missionSchema = z.object({
  match_id: z.number().int().positive(),
  place_name: z.string().min(1, "장소 이름을 입력해주세요"),
  place_address: z.string().min(1, "장소 주소를 입력해주세요"),
  place_lat: z.number().min(-90).max(90),
  place_lng: z.number().min(-180).max(180),
  place_category: z.enum(PLACE_CATEGORIES, {
    error: "허용된 장소 카테고리를 선택해주세요",
  }),
  user_a_prop_category: z.enum(PROP_CATEGORIES, {
    error: "허용된 소품 카테고리를 선택해주세요",
  }),
  user_a_prop_name: z.string().min(1),
  user_a_prop_description: z.string().optional(),
  user_b_prop_category: z.enum(PROP_CATEGORIES, {
    error: "허용된 소품 카테고리를 선택해주세요",
  }),
  user_b_prop_name: z.string().min(1),
  user_b_prop_description: z.string().optional(),
  user_a_action: z.string().optional(),
  user_b_action: z.string().optional(),
  meeting_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다"),
  meeting_time: z.string().regex(/^\d{2}:\d{2}$/, "시간 형식이 올바르지 않습니다"),
}).refine(
  (data) => PROP_OPTIONS[data.user_a_prop_category as PropCategory]?.includes(data.user_a_prop_name),
  { message: "허용되지 않은 소품입니다 (A)", path: ["user_a_prop_name"] }
).refine(
  (data) => PROP_OPTIONS[data.user_b_prop_category as PropCategory]?.includes(data.user_b_prop_name),
  { message: "허용되지 않은 소품입니다 (B)", path: ["user_b_prop_name"] }
);

export type MissionInput = z.infer<typeof missionSchema>;

export const departureConfirmSchema = z.object({
  mission_id: z.number().int().positive(),
});

export type DepartureConfirmInput = z.infer<typeof departureConfirmSchema>;
