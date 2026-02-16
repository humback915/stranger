"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ROUTES } from "@/lib/constants/routes";

export default function LandingPage() {
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

        <p className="mt-4 text-lg text-gray-400">
          사진도, 채팅도 없이
          <br />
          가치관만으로 만나는 블라인드 데이팅
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
          시작하기
        </Link>

        <p className="mt-4 text-sm text-gray-500">
          양자택일 질문 &rarr; AI 매칭 &rarr; 영화 같은 첫 만남
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-16 grid max-w-sm grid-cols-3 gap-6 text-center"
      >
        {[
          { num: "20+", label: "가치관 질문" },
          { num: "AI", label: "장소 추천" },
          { num: "100%", label: "블라인드" },
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
