import { getTranslations } from "next-intl/server";
import PhoneLoginForm from "@/components/auth/PhoneLoginForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <div className="flex min-h-screen items-center justify-center bg-stranger-dark px-6">
      <div className="w-full max-w-md">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-stranger-light">
            Hello, Stranger
          </h1>
          <p className="mt-2 text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        <PhoneLoginForm />

        <p className="mt-8 text-center text-xs text-gray-500">
          {t("terms")}
        </p>
      </div>
    </div>
  );
}
