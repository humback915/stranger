import PhoneLoginForm from "@/components/auth/PhoneLoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stranger-dark px-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-stranger-light">
            Hello, Stranger
          </h1>
          <p className="mt-2 text-gray-400">
            가치관으로 만나는 블라인드 데이팅
          </p>
        </div>

        <PhoneLoginForm />

        <p className="mt-8 text-center text-xs text-gray-500">
          가입 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
