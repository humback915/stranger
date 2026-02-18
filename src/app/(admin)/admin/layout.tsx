import { type ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/actions/admin";
import { ROUTES } from "@/lib/constants/routes";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-stranger-dark">
      <header className="sticky top-0 z-40 border-b border-stranger-mid bg-stranger-dark/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
          <Link
            href={ROUTES.ADMIN.ROOT}
            className="text-lg font-bold text-stranger-accent"
          >
            Admin
          </Link>
          <nav className="flex gap-4">
            <Link
              href={ROUTES.ADMIN.REPORTS}
              className="text-sm text-gray-400 transition-colors hover:text-stranger-light"
            >
              신고 관리
            </Link>
            <Link
              href={ROUTES.ADMIN.USERS}
              className="text-sm text-gray-400 transition-colors hover:text-stranger-light"
            >
              사용자 관리
            </Link>
            <Link
              href={ROUTES.ADMIN.NO_SHOWS}
              className="text-sm text-gray-400 transition-colors hover:text-stranger-light"
            >
              노쇼 현황
            </Link>
          </nav>
          <Link
            href={ROUTES.HOME}
            className="ml-auto text-sm text-gray-400 hover:text-stranger-light"
          >
            앱으로 돌아가기
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
