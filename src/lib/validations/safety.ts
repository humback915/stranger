import { z } from "zod";

export const REPORT_TYPES = [
  "harassment",
  "inappropriate",
  "no_show",
  "safety",
  "other",
] as const;

export const safetyReportSchema = z.object({
  reported_user_id: z.string().uuid("유효하지 않은 사용자 ID입니다"),
  mission_id: z.number().int().positive().optional(),
  report_type: z.enum(REPORT_TYPES, {
    error: "신고 유형을 선택해주세요",
  }),
  description: z
    .string()
    .max(500, "설명은 500자 이내로 입력해주세요")
    .optional(),
  reporter_lat: z.number().min(-90).max(90).optional(),
  reporter_lng: z.number().min(-180).max(180).optional(),
});

export type SafetyReportInput = z.infer<typeof safetyReportSchema>;
