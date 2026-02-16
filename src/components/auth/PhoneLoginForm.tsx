"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { phoneSchema, type PhoneFormValues } from "@/lib/validations/auth";
import { sendOtp } from "@/actions/auth";
import { ROUTES } from "@/lib/constants/routes";
import PhoneInput from "@/components/ui/PhoneInput";
import Button from "@/components/ui/Button";

export default function PhoneLoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const onSubmit = async (data: PhoneFormValues) => {
    setLoading(true);
    setServerError("");

    const result = await sendOtp(data.phone);

    if (result.error) {
      setServerError(result.error);
      setLoading(false);
      return;
    }

    // 전화번호를 세션에 저장하고 OTP 인증 페이지로 이동
    sessionStorage.setItem("auth_phone", data.phone);
    router.push(ROUTES.VERIFY);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <label className="mb-2 block text-sm text-gray-400">
          휴대폰 번호
        </label>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <PhoneInput
              value={field.value}
              onChange={field.onChange}
              error={errors.phone?.message}
            />
          )}
        />
      </div>

      {serverError && (
        <p className="text-sm text-stranger-accent">{serverError}</p>
      )}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        인증번호 받기
      </Button>
    </form>
  );
}
