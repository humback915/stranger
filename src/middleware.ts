import createMiddleware from "next-intl/middleware";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const locales = routing.locales as unknown as string[];
const defaultLocale = routing.defaultLocale;

/** RLS를 우회하는 admin 클라이언트로 프로필 존재 여부 확인 */
async function hasProfile(userId: string): Promise<boolean> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.warn("[middleware] SUPABASE_SERVICE_ROLE_KEY not set, skipping profile check");
    return true;
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  return !!data;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일 제외
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 푸시 알림 API 경로는 별도 인증 사용
  if (pathname.startsWith("/api/push")) {
    return NextResponse.next();
  }

  // 크론 API 경로는 자체 시크릿 인증 사용
  if (pathname.startsWith("/api/cron")) {
    return NextResponse.next();
  }

  // Auth callback은 그대로 통과
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // intl 미들웨어 먼저 실행 (locale prefix 없으면 redirect)
  const intlResponse = intlMiddleware(request);

  // intl이 redirect를 반환하면 (locale prefix 추가 등) 그대로 반환
  if (intlResponse.headers.has("location")) {
    return intlResponse;
  }

  // locale prefix가 이미 있는 경우: auth 가드 실행
  const pathParts = pathname.split("/").filter(Boolean);
  const locale = locales.includes(pathParts[0]) ? pathParts[0] : defaultLocale;
  const pathWithoutLocale = locales.includes(pathParts[0])
    ? "/" + pathParts.slice(1).join("/")
    : pathname;

  const { user, supabaseResponse } = await updateSession(request);

  // next-intl이 설정한 로케일 헤더를 supabaseResponse에 복사
  // (intlMiddleware가 설정한 x-next-intl-locale 헤더가 없으면 Server Components가 항상 ko로 폴백됨)
  intlResponse.headers.forEach((value, key) => {
    if (key.startsWith("x-next-intl")) {
      supabaseResponse.headers.set(key, value);
    }
  });

  const publicPaths = ["/login", "/verify"];
  const isPublicPath =
    publicPaths.some((path) => pathWithoutLocale === path) ||
    pathWithoutLocale === "/" ||
    pathWithoutLocale === "";

  // 미인증 사용자 → /login으로 리다이렉트
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // 인증된 사용자가 로그인/인증 페이지 접근 시
  if (user && (pathWithoutLocale === "/login" || pathWithoutLocale === "/verify")) {
    const profileExists = await hasProfile(user.id);
    return NextResponse.redirect(
      new URL(
        profileExists ? `/${locale}/home` : `/${locale}/onboarding`,
        request.url
      )
    );
  }

  // 인증된 사용자가 메인 앱에 접근할 때 프로필 확인
  if (
    user &&
    !isPublicPath &&
    !pathWithoutLocale.startsWith("/onboarding") &&
    !pathWithoutLocale.startsWith("/admin")
  ) {
    const profileExists = await hasProfile(user.id);
    if (!profileExists) {
      return NextResponse.redirect(new URL(`/${locale}/onboarding`, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
