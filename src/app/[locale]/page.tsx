"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";

export default function LandingPage() {
  const t = useTranslations("landing");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stranger-dark px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold text-stranger-light sm:text-5xl">
          Hello,{" "}
          <span className="text-stranger-accent">Stranger</span>
        </h1>

        <p className="mt-4 text-lg text-gray-400 whitespace-pre-line">
          {t("subtitle")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-12 flex flex-col gap-4"
      >
        <Link
          href={ROUTES.LOGIN}
          className="rounded-2xl bg-stranger-accent px-10 py-4 text-lg font-medium text-white transition-transform hover:scale-105 active:scale-95"
        >
          {t("start")}
        </Link>

        <p className="mt-4 text-sm text-gray-500">
          {t("description")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-16 grid max-w-sm grid-cols-3 gap-6 text-center"
      >
        {[
          { num: "20+", label: t("stat_questions") },
          { num: "AI", label: t("stat_ai") },
          { num: "100%", label: t("stat_blind") },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-2xl font-bold text-stranger-accent">
              {stat.num}
            </div>
            <div className="mt-1 text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
