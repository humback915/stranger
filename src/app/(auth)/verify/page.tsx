import OtpVerificationForm from "@/components/auth/OtpVerificationForm";

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stranger-dark px-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-stranger-light">
            인증번호 확인
          </h1>
        </div>

        <OtpVerificationForm />
      </div>
    </div>
  );
}
