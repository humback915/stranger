import { z } from "zod";

const currentYear = new Date().getFullYear();

export const profileSchema = z.object({
  birth_year: z
    .number()
    .int()
    .min(1924, "올바른 출생연도를 입력해주세요")
    .max(currentYear - 19, "만 19세 이상만 가입할 수 있습니다"),
  gender: z.enum(["male", "female"], {
    message: "성별을 선택해주세요",
  }),
  occupation: z
    .string()
    .min(1, "직업을 입력해주세요")
    .max(50, "50자 이내로 입력해주세요"),
  mbti: z
    .string()
    .nullable()
    .optional(),
  activity_area: z.string().min(1, "활동 지역을 선택해주세요"),
  activity_lat: z.number(),
  activity_lng: z.number(),
  preferred_gender: z.enum(["male", "female", "any"], {
    message: "선호 성별을 선택해주세요",
  }),
  hobbies: z.array(z.string()).max(5).default([]),
  personality: z.array(z.string()).max(5).default([]),
  ideal_type: z.array(z.string()).max(5).default([]),
  preferred_age_min: z.number().int().min(19).default(19),
  preferred_age_max: z.number().int().max(100).default(100),
  preferred_distance_km: z.number().int().min(1).max(100).default(10),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
