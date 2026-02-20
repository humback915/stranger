"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { verifyOtp, sendOtp } from "@/actions/auth";
import { useCountdown } from "@/hooks/useCountdown";
import { ROUTES } from "@/lib/constants/routes";
import OtpInput from "@/components/ui/OtpInput";
import Button from "@/components/ui/Button";

export default function OtpVerificationForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { formatted, isRunning, start } = useCountdown(180);

  useEffect(() => {
    const stored = sessionStorage.getItem("auth_phone");
    if (!stored) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    setPhone(stored);
    start();
  }, [router, start]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setLoading(true);
    setServerError("");

    const result = await verifyOtp(phone, otp);

    if (result.error) {
      setServerError(result.error);
      setLoading(false);
      return;
    }

    sessionStorage.removeItem("auth_phone");
    // 미들웨어가 프로필 유무에 따라 /home 또는 /onboarding으로 분기
    router.replace(ROUTES.HOME);
  };

  const handleResend = async () => {
    setServerError("");
    const result = await sendOtp(phone);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    setOtp("");
    start();
  };

  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-sm text-gray-400">
          {t("otp_sent", { phone })}
        </p>
        {isRunning && (
          <p className="mt-1 text-sm text-stranger-accent">{formatted}</p>
        )}
      </div>

      <OtpInput
        value={otp}
        onChange={setOtp}
        error={serverError}
      />

      <Button
        onClick={handleVerify}
        loading={loading}
        disabled={otp.length !== 6}
        className="w-full"
        size="lg"
      >
        {t("verify_otp")}
      </Button>

      <button
        type="button"
        onClick={handleResend}
        disabled={isRunning}
        className="text-sm text-gray-400 hover:text-stranger-light disabled:opacity-50 transition-colors"
      >
        {isRunning ? t("resend_countdown", { countdown: formatted }) : t("resend_otp")}
      </button>
    </div>
  );
}
