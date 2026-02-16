import { z } from "zod";

// 한국 휴대폰 번호 정규식 (010-XXXX-XXXX 또는 01012345678)
const PHONE_REGEX = /^010-?\d{4}-?\d{4}$/;

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "전화번호를 입력해주세요")
    .regex(PHONE_REGEX, "올바른 휴대폰 번호를 입력해주세요 (010-XXXX-XXXX)"),
});

export const otpSchema = z.object({
  token: z
    .string()
    .length(6, "인증번호 6자리를 입력해주세요")
    .regex(/^\d{6}$/, "숫자만 입력해주세요"),
});

/** 010-1234-5678 → +821012345678 (E.164 형식) */
export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `+82${digits.startsWith("0") ? digits.slice(1) : digits}`;
}

/** +821012345678 → 010-1234-5678 */
export function fromE164(e164: string): string {
  const digits = e164.replace("+82", "0");
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export type PhoneFormValues = z.infer<typeof phoneSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
