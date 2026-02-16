import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const publicPaths = ["/", "/login", "/verify", "/api/auth/callback"];

/** RLS를 우회하는 admin 클라이언트로 프로필 존재 여부 확인 */
async function hasProfile(userId: string): Promise<boolean> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    // service_role 키가 없으면 프로필이 있다고 간주 (온보딩 루프 방지)
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

  // 정적 파일과 API 라우트는 제외
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const { user, supabaseResponse } = await updateSession(request);

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith("/api/auth")
  );

  // 미인증 사용자 → 공개 경로 아니면 /login으로 리다이렉트
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 인증된 사용자 → 로그인/인증 페이지 접근 시 프로필 상태 확인
  if (user && (pathname === "/login" || pathname === "/verify")) {
    const profileExists = await hasProfile(user.id);
    const url = request.nextUrl.clone();
    url.pathname = profileExists ? "/home" : "/onboarding";
    return NextResponse.redirect(url);
  }

  // 인증된 사용자가 메인 앱에 접근할 때 프로필이 있는지 확인
  if (user && !isPublicPath && !pathname.startsWith("/onboarding")) {
    const profileExists = await hasProfile(user.id);

    if (!profileExists) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
