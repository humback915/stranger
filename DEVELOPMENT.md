# Hello, Stranger - 개발 문서

> 사진/채팅 없이, 가치관 기반 이진 선택 질문으로 매칭 → AI가 장소·소품을 지정 → 실제 만남까지 연결하는 블라인드 데이팅 앱

---

## 목차

1. [기술 스택](#기술-스택)
2. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
3. [프로젝트 구조](#프로젝트-구조)
4. [작업 이력 (Task 단위)](#작업-이력-task-단위)
5. [DB 스키마](#db-스키마)
6. [DB 툴 접근 방법](#db-툴-접근-방법)
7. [DB CLI 명령어 레퍼런스](#db-cli-명령어-레퍼런스)
8. [주요 기능 상세](#주요-기능-상세)

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript 5 |
| DB / Auth | Supabase (PostgreSQL + RLS + Phone OTP) |
| 스타일링 | Tailwind CSS 3.4 (커스텀 테마) |
| 폼 관리 | React Hook Form 7 + Zod 4 |
| 애니메이션 | Framer Motion 12 |
| 폰트 | Pretendard Variable (한국어) |
| 패키지 매니저 | pnpm |

---

## 로컬 개발 환경 설정

### 1. 사전 요구사항

- **Node.js** 18 이상
- **pnpm** (`npm install -g pnpm`)
- **Supabase CLI** (`brew install supabase/tap/supabase`)
- Supabase 프로젝트 (Cloud 또는 Local)

### 2. 프로젝트 클론 및 의존성 설치

```bash
git clone <repo-url>
cd stranger
pnpm install
```

### 3. 환경 변수 설정

환경별로 분리된 `.env` 파일을 사용합니다.

| 파일 | 용도 | 로딩 시점 | Git |
|------|------|-----------|-----|
| `.env.development.local` | 로컬 개발 (Docker Supabase) | `pnpm dev` | ignored |
| `.env.production.local` | 운영 (Cloud Supabase) | `pnpm build` / `pnpm start` | ignored |
| `.env.example` | 템플릿 (값 없음) | - | committed |

> `.env.local`은 **모든 환경에서 로딩**되므로 사용하지 마세요.

#### 로컬 개발용 설정

```bash
cp .env.example .env.development.local
```

`supabase start` 실행 후 출력되는 값으로 채웁니다:

```env
# 로컬 Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase start 출력값 - anon key>
SUPABASE_SERVICE_ROLE_KEY=<supabase start 출력값 - service_role key>

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 운영용 설정

```bash
cp .env.example .env.production.local
```

Supabase Dashboard에서 키를 복사합니다:

```env
# Cloud Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Dashboard → Settings → API → anon public>
SUPABASE_SERVICE_ROLE_KEY=<Dashboard → Settings → API → service_role>

NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

**Supabase 키 확인 방법:**
1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택
2. Settings → API → `Project URL`, `anon public`, `service_role` 복사

### 4. Supabase DB 마이그레이션

#### 방법 A: Supabase CLI (로컬 DB)

```bash
# 로컬 Supabase 시작
supabase start

# 마이그레이션 실행
supabase db reset
```

이 경우 `.env.local`의 Supabase URL/Key를 로컬 값으로 변경합니다:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<로컬 anon key>
```

`supabase start` 실행 시 터미널에 키 값이 출력됩니다.

#### 방법 B: Cloud Supabase (SQL Editor에서 직접 실행)

Supabase Dashboard → SQL Editor에서 마이그레이션 파일을 순서대로 실행합니다:

```
supabase/migrations/00001_create_profiles.sql
supabase/migrations/00002_create_questions.sql
supabase/migrations/00003_create_user_answers.sql
supabase/migrations/00004_create_matches.sql
supabase/migrations/00005_create_missions.sql
supabase/migrations/00006_create_safety_reports.sql
supabase/migrations/00007_create_no_show_checks.sql
supabase/migrations/00008_create_rls_policies.sql
supabase/migrations/00009_add_place_and_prop_category.sql
```

#### 방법 C: Supabase CLI (리모트 DB에 push)

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### 5. Supabase Auth 설정

Supabase Dashboard → Authentication → Providers에서:

1. **Phone (OTP)** 활성화
2. SMS Provider 설정 (Twilio 등) 또는 개발 중에는 Supabase의 기본 테스트 모드 사용

> 로컬 개발 시 Supabase Dashboard → Authentication → Users에서 테스트 유저를 수동 생성할 수 있습니다.

### 6. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000` 접속

### 7. 사용 가능한 스크립트

```bash
pnpm dev       # 개발 서버 (HMR)
pnpm build     # 프로덕션 빌드
pnpm start     # 프로덕션 서버
pnpm lint      # ESLint 검사
```

### 8. 추가 참고

- **커스텀 테마 색상**: `tailwind.config.ts`에 정의
  - `stranger-dark`: `#1a1a2e` (배경)
  - `stranger-mid`: `#16213e` (카드 배경)
  - `stranger-accent`: `#e94560` (포인트 빨간색)
  - `stranger-light`: `#f5f5f5` (텍스트)

- **경로 별칭**: `@/*` → `src/*` (`tsconfig.json`)

---

## 프로젝트 구조

```
stranger/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 인증 관련 라우트 그룹
│   │   │   ├── login/page.tsx        # 전화번호 로그인
│   │   │   ├── verify/page.tsx       # OTP 인증
│   │   │   └── onboarding/           # 5단계 온보딩
│   │   │       ├── page.tsx          # Step 1: 나이/성별
│   │   │       ├── occupation/       # Step 2: 직업
│   │   │       ├── mbti/             # Step 3: MBTI (선택)
│   │   │       ├── area/             # Step 4: 활동 지역
│   │   │       ├── preferences/      # Step 5: 선호도
│   │   │       └── complete/         # 완료 화면
│   │   ├── (main)/                   # 메인 앱 라우트 그룹
│   │   │   ├── layout.tsx            # BottomNav + SafetyButton
│   │   │   ├── home/                 # 홈
│   │   │   ├── questions/            # 질문 (placeholder)
│   │   │   ├── matches/              # 매칭 (placeholder)
│   │   │   ├── missions/[id]/        # 미션 상세
│   │   │   └── settings/             # 설정 (placeholder)
│   │   ├── api/auth/callback/        # Supabase Auth 콜백
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   └── page.tsx                  # 랜딩 페이지
│   │
│   ├── actions/                      # Server Actions
│   │   ├── auth.ts                   # sendOtp, verifyOtp, signOut
│   │   ├── profile.ts               # createProfile, updateProfile
│   │   ├── safety.ts                # submitSafetyReport
│   │   └── mission.ts               # confirmDeparture, checkNoShow, getMission
│   │
│   ├── components/
│   │   ├── auth/                     # 인증 폼 컴포넌트
│   │   │   ├── PhoneLoginForm.tsx
│   │   │   └── OtpVerificationForm.tsx
│   │   ├── layout/                   # 레이아웃 컴포넌트
│   │   │   ├── BottomNav.tsx         # 하단 네비게이션 (4탭)
│   │   │   └── SafetyButton.tsx      # 긴급 신고 FAB
│   │   ├── mission/                  # 미션 컴포넌트
│   │   │   ├── MissionCard.tsx       # 미션 카드
│   │   │   └── DepartureConfirmation.tsx  # 출발 확인
│   │   ├── motion/
│   │   │   └── PageTransition.tsx    # 페이지 전환 애니메이션
│   │   ├── onboarding/               # 온보딩 단계 컴포넌트
│   │   │   ├── AgeGenderStep.tsx
│   │   │   ├── OccupationStep.tsx
│   │   │   ├── MbtiStep.tsx
│   │   │   ├── ActivityAreaStep.tsx
│   │   │   └── PreferencesStep.tsx
│   │   └── ui/                       # 공통 UI 컴포넌트
│   │       ├── Button.tsx
│   │       ├── PhoneInput.tsx
│   │       └── OtpInput.tsx
│   │
│   ├── hooks/
│   │   ├── useCountdown.ts           # 범용 카운트다운 (OTP용)
│   │   └── useMissionCountdown.ts    # 미션 전용 카운트다운
│   │
│   ├── lib/
│   │   ├── constants/
│   │   │   ├── routes.ts             # 앱 라우트 상수
│   │   │   ├── areas.ts              # 지역/구 + 좌표 (서울25 경기10 부산5)
│   │   │   ├── mbti.ts               # MBTI 16종 + 한국어 라벨
│   │   │   ├── places.ts             # Open Place 카테고리 7종 + 예시
│   │   │   └── props.ts              # 식별 소품 카테고리 5종 + 화이트리스트
│   │   ├── supabase/
│   │   │   ├── client.ts             # 브라우저용 Supabase 클라이언트
│   │   │   ├── server.ts             # 서버용 Supabase 클라이언트
│   │   │   └── middleware.ts          # 미들웨어용 세션 갱신
│   │   └── validations/
│   │       ├── auth.ts               # 전화번호/OTP Zod 스키마
│   │       ├── profile.ts            # 프로필 Zod 스키마
│   │       ├── mission.ts            # 미션(장소+소품) Zod 스키마
│   │       └── safety.ts             # 신고 Zod 스키마
│   │
│   ├── providers/
│   │   └── AuthProvider.tsx           # Auth 상태 Context
│   │
│   ├── types/
│   │   └── database.ts               # Supabase DB 타입 정의
│   │
│   └── middleware.ts                  # 인증/프로필 가드
│
├── supabase/
│   └── migrations/                   # DB 마이그레이션 (9개)
│       ├── 00001_create_profiles.sql
│       ├── 00002_create_questions.sql
│       ├── 00003_create_user_answers.sql
│       ├── 00004_create_matches.sql
│       ├── 00005_create_missions.sql
│       ├── 00006_create_safety_reports.sql
│       ├── 00007_create_no_show_checks.sql
│       ├── 00008_create_rls_policies.sql
│       └── 00009_add_place_and_prop_category.sql
│
├── .env.example
├── .env.local                        # (gitignored)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

---

## 작업 이력 (Task 단위)

### Task 1: 프로젝트 초기 설정 및 인프라

**범위:** 프로젝트 스캐폴딩 + Supabase 연동 + 미들웨어

| 파일 | 설명 |
|------|------|
| `package.json` | Next.js 14, Supabase, Zod 4, Framer Motion, React Hook Form 의존성 |
| `tailwind.config.ts` | 커스텀 다크 테마 (stranger-dark/mid/accent/light) |
| `tsconfig.json` | 경로 별칭 `@/*` 설정 |
| `src/app/layout.tsx` | 루트 레이아웃 (Pretendard 폰트, 메타데이터) |
| `src/app/globals.css` | Tailwind 기본 + 글로벌 스타일 |
| `.env.example` | 환경 변수 템플릿 |

### Task 2: Supabase DB 스키마 설계 및 마이그레이션

**범위:** 7개 테이블 + RLS 정책 설계

| 마이그레이션 | 테이블 | 핵심 필드 |
|-------------|--------|-----------|
| `00001` | `profiles` | id(UUID), phone, birth_year, gender, occupation, mbti, activity_area, 선호도, status, no_show_count |
| `00002` | `questions` | category(5종), question_text, option_a/b, weight(1-5), is_active |
| `00003` | `user_answers` | user_id FK, question_id FK, answer('a'/'b'), UNIQUE(user_id, question_id) |
| `00004` | `matches` | user_a_id/b_id FKs, similarity_score, compatibility_score, distance_km, status(5종) |
| `00005` | `missions` | match_id FK, place 정보, user_a/b prop, meeting_date/time, departure_confirmed |
| `00006` | `safety_reports` | reporter/reported FKs, report_type(5종), 위치정보, status |
| `00007` | `no_show_checks` | mission_id FK, user_id FK, status, check_deadline |
| `00008` | RLS Policies | 모든 테이블 Row Level Security 활성화 |

**타입 정의:**
| 파일 | 설명 |
|------|------|
| `src/types/database.ts` | 전체 DB 타입 (Row/Insert/Update/Relationships) |

### Task 3: Supabase 클라이언트 및 Auth 인프라

**범위:** 클라이언트/서버/미들웨어용 Supabase 인스턴스 + 인증 흐름

| 파일 | 설명 |
|------|------|
| `src/lib/supabase/client.ts` | 브라우저 Supabase 클라이언트 (createBrowserClient) |
| `src/lib/supabase/server.ts` | 서버 Supabase 클라이언트 (createServerClient + cookies) |
| `src/lib/supabase/middleware.ts` | 미들웨어 세션 갱신 (updateSession) |
| `src/middleware.ts` | 인증 가드: 미인증→/login, 프로필 미완성→/onboarding |
| `src/providers/AuthProvider.tsx` | 클라이언트 Auth Context (onAuthStateChange 리스너) |

### Task 4: 전화번호 OTP 로그인

**범위:** 로그인 → OTP 인증 전체 플로우

| 파일 | 설명 |
|------|------|
| `src/lib/validations/auth.ts` | Zod: phoneSchema, otpSchema, toE164(), fromE164() |
| `src/actions/auth.ts` | Server Actions: sendOtp(), verifyOtp(), signOut() |
| `src/components/ui/PhoneInput.tsx` | 010-XXXX-XXXX 자동 포맷 입력 |
| `src/components/ui/OtpInput.tsx` | 6자리 OTP 입력 (자동 포커스, 붙여넣기 지원) |
| `src/components/auth/PhoneLoginForm.tsx` | 전화번호 입력 → OTP 발송 폼 |
| `src/components/auth/OtpVerificationForm.tsx` | OTP 인증 + 180초 카운트다운 + 재전송 |
| `src/hooks/useCountdown.ts` | 범용 카운트다운 훅 (기본 180초) |
| `src/app/(auth)/login/page.tsx` | 로그인 페이지 |
| `src/app/(auth)/verify/page.tsx` | OTP 인증 페이지 |
| `src/app/api/auth/callback/route.ts` | Supabase Auth 콜백 핸들러 |

### Task 5: 5단계 온보딩

**범위:** 나이/성별 → 직업 → MBTI → 활동지역 → 선호도 → 프로필 생성

| 파일 | 설명 |
|------|------|
| `src/lib/validations/profile.ts` | 프로필 Zod 스키마 |
| `src/lib/constants/mbti.ts` | MBTI 16종 + 한국어 라벨 |
| `src/lib/constants/areas.ts` | 서울(25구)/경기(10시)/부산(5구) + 위경도 |
| `src/actions/profile.ts` | createProfile(), updateProfile() Server Actions |
| `src/components/onboarding/AgeGenderStep.tsx` | Step 1: 출생연도 + 성별 (19세 이상 검증) |
| `src/components/onboarding/OccupationStep.tsx` | Step 2: 14개 직업 + 직접입력 |
| `src/components/onboarding/MbtiStep.tsx` | Step 3: 4x4 MBTI 그리드 (선택) |
| `src/components/onboarding/ActivityAreaStep.tsx` | Step 4: 지역 탭 → 구/시 버튼 선택 |
| `src/components/onboarding/PreferencesStep.tsx` | Step 5: 선호 성별/나이범위/거리 → DB 저장 |
| `src/app/(auth)/onboarding/layout.tsx` | 프로그레스 바 + 단계 표시 |
| `src/app/(auth)/onboarding/[각 단계]/page.tsx` | 5개 온보딩 페이지 |
| `src/app/(auth)/onboarding/complete/page.tsx` | 완료 애니메이션 (3초 후 /home 이동) |

### Task 6: 메인 앱 레이아웃 및 네비게이션

**범위:** 하단 네비게이션 + 메인 페이지 껍데기

| 파일 | 설명 |
|------|------|
| `src/app/(main)/layout.tsx` | AuthProvider + BottomNav + SafetyButton 레이아웃 |
| `src/components/layout/BottomNav.tsx` | 4탭 하단 네비 (홈/질문/매칭/설정) |
| `src/components/motion/PageTransition.tsx` | 페이지 전환 슬라이드 애니메이션 |
| `src/components/ui/Button.tsx` | 공통 버튼 (primary/secondary/ghost, sm/md/lg) |
| `src/lib/constants/routes.ts` | 중앙화 라우트 상수 |
| `src/app/(main)/home/page.tsx` | 홈 페이지 |
| `src/app/(main)/questions/page.tsx` | 질문 페이지 (placeholder) |
| `src/app/(main)/matches/page.tsx` | 매칭 페이지 (placeholder) |
| `src/app/(main)/settings/page.tsx` | 설정 페이지 (placeholder) |
| `src/app/page.tsx` | 랜딩 페이지 (Framer Motion 히어로) |

### Task 7: 긴급 신고 기능 완성

**범위:** SafetyButton 껍데기 → 실제 동작하는 3단계 신고 시스템

| 파일 | 변경 | 설명 |
|------|------|------|
| `src/lib/validations/safety.ts` | 신규 | Zod: report_type(5종 ENUM), description(500자), 위치 |
| `src/actions/safety.ts` | 신규 | submitSafetyReport() - auth 확인 → safety_reports INSERT |
| `src/components/layout/SafetyButton.tsx` | 수정 | 3단계 모달: ① 메인(112/신고/닫기) → ② 신고폼(유형선택+설명+위치) → ③ 완료 |

**핵심 동작:**
- **112 긴급 신고**: `<a href="tel:112">` 로 실제 전화 연결
- **상대방 신고**: 5가지 신고 유형 선택 → 상세 설명 (선택) → `navigator.geolocation` 위치 자동 수집 → DB 저장
- **3단계 UI**: main → report_form → done

### Task 8: Open Place 강제 로직

**범위:** 미션 장소를 공개 장소 카테고리로 강제 제한

| 파일 | 변경 | 설명 |
|------|------|------|
| `src/lib/constants/places.ts` | 신규 | 7개 장소 카테고리 + 카테고리별 대표 장소 + isOpenPlace() 검증 |
| `src/lib/validations/mission.ts` | 신규 | place_category Zod enum 검증 |
| `supabase/migrations/00009_...sql` | 신규 | place_category 컬럼 + CHECK 제약 |
| `src/types/database.ts` | 수정 | missions 타입에 place_category 추가 |

**허용 장소 카테고리 (7종):**
| 코드 | 한국어 | 예시 |
|------|--------|------|
| cafe | 카페 | 스타벅스, 투썸플레이스, 이디야 |
| bookstore | 서점 | 교보문고, 영풍문고 |
| park | 공원/광장 | 여의도 한강공원, 올림픽공원 |
| museum | 미술관/박물관 | 국립현대미술관 |
| library | 도서관 | 국립중앙도서관 |
| mall | 대형 쇼핑몰 푸드코트 | 코엑스 푸드코트 |
| restaurant | 프랜차이즈 레스토랑 | 빕스, 아웃백 |

### Task 9: 소품(Prop) 현실성 제한

**범위:** 자유 텍스트 소품 → 사전 정의된 화이트리스트 내 선택으로 강제

| 파일 | 변경 | 설명 |
|------|------|------|
| `src/lib/constants/props.ts` | 신규 | 5개 소품 카테고리 + 카테고리별 선택지 배열 + isAllowedProp() |
| `src/lib/validations/mission.ts` | 수정 | prop_category Zod enum + .refine()으로 허용 목록 교차 검증 |
| `supabase/migrations/00009_...sql` | 포함 | user_a/b_prop_category 컬럼 + CHECK 제약 |
| `src/types/database.ts` | 수정 | missions 타입에 user_a/b_prop_category 추가 |

**소품 카테고리 (5종):**
| 카테고리 | 한국어 | 선택지 예시 |
|----------|--------|-------------|
| clothing_color | 옷 색상 | 빨간색 상의, 파란색 모자, 흰색 운동화... (9개) |
| phone_screen | 휴대폰 화면 | 노란색 배경, 하트 이모지 화면... (5개) |
| convenience_item | 편의점 아이템 | 바나나우유, 파란색 게토레이, 초록색 우산... (6개) |
| accessory | 액세서리 | 손목시계, 에코백, 선글라스... (6개) |
| book_magazine | 책/잡지 | 아무 책 한 권, 오늘자 신문... (4개) |

### Task 10: No-Show 방지 시스템

**범위:** 출발 확인 + 노쇼 자동 감지 + 페널티 전체 파이프라인

| 파일 | 변경 | 설명 |
|------|------|------|
| `src/actions/mission.ts` | 신규 | confirmDeparture(), checkNoShow(), getMission() |
| `src/hooks/useMissionCountdown.ts` | 신규 | 만남 시간까지 실시간 카운트다운 + canConfirm 계산 |
| `src/components/mission/DepartureConfirmation.tsx` | 신규 | 출발 확인 UI (카운트다운 + 양쪽 상태 표시 + 확인 버튼) |
| `src/components/mission/MissionCard.tsx` | 신규 | 미션 상세 카드 (장소/일시/소품/출발확인 통합) |
| `src/app/(main)/missions/[id]/page.tsx` | 신규 | 미션 상세 페이지 (SSR) |
| `src/lib/constants/routes.ts` | 수정 | MISSIONS, MISSION_DETAIL 라우트 추가 |

**출발 확인 플로우:**
1. 만남 1시간 전까지 → 버튼 비활성화 + "만남 1시간 전부터 확인 가능" 표시
2. 만남 1시간 전 ~ 만남 시간 → "출발합니다!" 버튼 활성화
3. 버튼 클릭 → `confirmDeparture()` → `missions.user_X_departure_confirmed = true` + `no_show_checks.status = 'confirmed'`
4. 데드라인 경과 후 미확인 → `checkNoShow()` → `no_show_checks.status = 'no_show'` + `profiles.no_show_count += 1`
5. **3회 이상 노쇼 → `profiles.status = 'banned'` (계정 정지)**

---

## DB 스키마

```
profiles
├── id (UUID, PK, FK → auth.users)
├── phone, birth_year, gender, occupation, mbti
├── activity_area, activity_lat, activity_lng
├── preferred_gender, preferred_age_min/max, preferred_distance_km
├── status (active/paused/banned)
└── no_show_count

questions
├── id (SERIAL, PK)
├── category (values/lifestyle/romance/personality/taste)
├── question_text, option_a, option_b
├── weight (1-5), is_active
└── created_at

user_answers
├── id (SERIAL, PK)
├── user_id (FK → profiles)
├── question_id (FK → questions)
├── answer ('a' / 'b')
└── UNIQUE(user_id, question_id)

matches
├── id (SERIAL, PK)
├── user_a_id, user_b_id (FKs → profiles)
├── similarity_score, compatibility_score, distance_km
├── status (pending/accepted/rejected/expired/completed)
└── CHECK(user_a_id < user_b_id)

missions
├── id (SERIAL, PK)
├── match_id (FK → matches)
├── place_name, place_address, place_lat/lng
├── place_category (cafe/bookstore/park/museum/library/mall/restaurant)
├── user_a/b_prop_category (clothing_color/phone_screen/convenience_item/accessory/book_magazine)
├── user_a/b_prop_name, user_a/b_prop_description
├── meeting_date, meeting_time
├── user_a/b_departure_confirmed
└── status (scheduled/in_progress/completed/cancelled)

safety_reports
├── id (SERIAL, PK)
├── reporter_id, reported_user_id (FKs → profiles)
├── mission_id (FK → missions, nullable)
├── report_type (harassment/inappropriate/no_show/safety/other)
├── description, reporter_lat/lng
└── status (pending/reviewing/resolved/dismissed)

no_show_checks
├── id (SERIAL, PK)
├── mission_id (FK → missions), user_id (FK → profiles)
├── status (pending/confirmed/no_show)
├── check_deadline, confirmed_at
└── UNIQUE(mission_id, user_id)
```

---

## DB 툴 접근 방법

Supabase 프로젝트의 PostgreSQL DB에 외부 툴로 접근하는 방법입니다.

### 접속 정보 확인

**Supabase Dashboard에서 확인:**
1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택
2. **Settings → Database** 에서 접속 정보 확인

**Connection 정보 (Cloud):**

| 항목 | 값 |
|------|-----|
| Host | `db.<project-ref>.supabase.co` |
| Port | `5432` (Direct) / `6543` (Pooler - Transaction mode) |
| Database | `postgres` |
| User | `postgres` |
| Password | 프로젝트 생성 시 설정한 DB 비밀번호 |

> DB 비밀번호를 모를 경우: Dashboard → Settings → Database → **Reset database password** 로 재설정

**Connection 정보 (로컬 - `supabase start` 실행 시):**

| 항목 | 값 |
|------|-----|
| Host | `127.0.0.1` |
| Port | `54322` |
| Database | `postgres` |
| User | `postgres` |
| Password | `postgres` |

---

### 1. Supabase Studio (웹 UI) - 가장 간편

별도 설치 없이 브라우저에서 바로 사용할 수 있습니다.

**Cloud:**
- Dashboard → **Table Editor** : 테이블 데이터 CRUD (엑셀처럼 직접 편집)
- Dashboard → **SQL Editor** : SQL 직접 실행
- Dashboard → **Database → Tables** : 스키마 확인, 컬럼 추가/수정

**로컬:**
```
supabase start
```
실행 후 `http://127.0.0.1:54323` 에서 로컬 Studio 접속

---

### 2. DBeaver (무료, 추천)

1. DBeaver 설치: https://dbeaver.io/download/
2. **Database → New Connection → PostgreSQL** 선택
3. 접속 정보 입력:

```
Host:     db.<project-ref>.supabase.co
Port:     5432
Database: postgres
Username: postgres
Password: <DB 비밀번호>
```

4. **Driver properties** 탭에서 추가 설정 (SSL):
   - `ssl` → `true`
   - `sslmode` → `require`

5. **Test Connection** → **Finish**

**로컬 DB 접속 시:**
```
Host:     127.0.0.1
Port:     54322
Database: postgres
Username: postgres
Password: postgres
```
(SSL 설정 불필요)

---

### 3. DataGrip (JetBrains, 유료)

1. **File → New → Data Source → PostgreSQL**
2. 접속 정보 입력:

```
Host:     db.<project-ref>.supabase.co
Port:     5432
User:     postgres
Password: <DB 비밀번호>
Database: postgres
```

3. **Advanced** 탭 → `ssl` = `true`, `sslmode` = `require`
4. **Test Connection** → **OK**

---

### 4. pgAdmin 4 (무료)

1. pgAdmin 설치: https://www.pgadmin.org/download/
2. **Servers → Register → Server**
3. **General** 탭: Name에 `stranger-dev` 등 입력
4. **Connection** 탭:

```
Host:              db.<project-ref>.supabase.co
Port:              5432
Maintenance DB:    postgres
Username:          postgres
Password:          <DB 비밀번호>
```

5. **SSL** 탭: SSL Mode → `Require`
6. **Save**

---

### 5. TablePlus (macOS 추천, 무료 기본)

1. TablePlus 설치: https://tableplus.com/
2. **Create a new connection → PostgreSQL**
3. 접속 정보 입력:

```
Host:     db.<project-ref>.supabase.co
Port:     5432
User:     postgres
Password: <DB 비밀번호>
Database: postgres
SSL:      Full Verification 또는 Required
```

4. **Test** → **Connect**

---

### 6. CLI (psql)

터미널에서 직접 SQL을 실행할 수 있습니다.

**Cloud 접속:**
```bash
psql "postgresql://postgres:<DB비밀번호>@db.<project-ref>.supabase.co:5432/postgres"
```

**로컬 접속:**
```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

**자주 쓰는 psql 명령어:**
```sql
\dt                        -- 테이블 목록
\d profiles                -- profiles 테이블 구조 확인
\d+ missions               -- missions 테이블 상세 (CHECK 제약 포함)
SELECT * FROM profiles;    -- 데이터 조회
\q                         -- 종료
```

---

### 7. Supabase CLI

```bash
# 로컬 DB 상태 확인
supabase status

# 로컬 DB에 SQL 실행
supabase db reset              # 마이그레이션 전체 재실행
supabase migration list        # 마이그레이션 목록

# 리모트 DB에 마이그레이션 적용
supabase link --project-ref <ref>
supabase db push

# 리모트 DB에서 타입 생성
supabase gen types typescript --linked > src/types/database.ts
```

---

### 8. VS Code 확장 프로그램

**SQLTools** + **SQLTools PostgreSQL Driver** 설치 후:

1. VS Code → SQLTools 아이콘 (좌측 사이드바)
2. **New Connection → PostgreSQL**
3. 접속 정보 입력 (위와 동일)
4. `.sql` 파일에서 Ctrl+E / Cmd+E로 쿼리 실행

---

### Connection Pooling 참고

| 연결 방식 | Port | 용도 |
|-----------|------|------|
| **Direct** | `5432` | DB 툴, 마이그레이션, 장시간 연결 |
| **Pooler (Transaction)** | `6543` | 앱 서버 (Serverless 환경 권장) |
| **Pooler (Session)** | `5432` | 세션 유지가 필요한 경우 |

- DB 툴로 접근할 때는 **Direct (5432)** 사용
- Next.js 앱에서는 Supabase JS 클라이언트가 자동으로 처리하므로 직접 설정 불필요

---

### 테이블 확인 빠른 참조

접속 후 아래 쿼리로 전체 테이블과 행 수를 확인할 수 있습니다:

```sql
SELECT
  schemaname,
  relname AS table_name,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;
```

RLS 정책 확인:
```sql
SELECT
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### DB CLI 명령어 레퍼런스

#### Supabase CLI (`supabase db execute`)

별도 DB 클라이언트 없이 바로 쿼리할 수 있습니다.

**테이블 목록 조회:**
```bash
supabase db execute "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

**특정 테이블 데이터 조회:**
```bash
supabase db execute "SELECT * FROM profiles;"
supabase db execute "SELECT * FROM missions LIMIT 10;"
```

**테이블 컬럼 구조 확인:**
```bash
supabase db execute "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'missions';"
```

**레코드 수 확인:**
```bash
supabase db execute "SELECT COUNT(*) FROM profiles;"
```

**조건 검색:**
```bash
supabase db execute "SELECT * FROM profiles WHERE status = 'active';"
supabase db execute "SELECT * FROM safety_reports WHERE report_type = 'harassment';"
supabase db execute "SELECT * FROM no_show_checks WHERE status = 'pending';"
```

**조인 검색 (미션 + 매치 정보):**
```bash
supabase db execute "SELECT m.id, m.place_name, m.meeting_date, m.status, ma.user_a_id, ma.user_b_id FROM missions m JOIN matches ma ON m.match_id = ma.id;"
```

---

#### psql 직접 접속

```bash
# 로컬 DB 접속
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Cloud DB 접속
psql "postgresql://postgres:<DB비밀번호>@db.<project-ref>.supabase.co:5432/postgres"
```

> psql 미설치 시: `brew install libpq && brew link --force libpq`

**psql 명령어 모음:**

| 명령어 | 용도 |
|--------|------|
| `\dt` | 전체 테이블 목록 |
| `\d missions` | 테이블 구조 (컬럼, 타입, 제약조건) |
| `\d+ missions` | 상세 구조 (용량, 설명 포함) |
| `\di` | 전체 인덱스 목록 |
| `\du` | 유저/롤 목록 |
| `\dn` | 스키마 목록 |
| `\x` | 세로 출력 모드 토글 (컬럼 많을 때 유용) |
| `\timing` | 쿼리 실행 시간 표시 토글 |
| `\i <파일경로>` | SQL 파일 실행 |
| `\copy` | CSV 내보내기/가져오기 |
| `\q` | 종료 |

**자주 쓰는 쿼리 예시:**

```sql
-- 전체 테이블 행 수 한눈에 보기
SELECT relname AS table_name, n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 특정 유저의 전체 데이터 추적
SELECT * FROM profiles WHERE id = '<user-uuid>';
SELECT * FROM user_answers WHERE user_id = '<user-uuid>';
SELECT * FROM matches WHERE user_a_id = '<user-uuid>' OR user_b_id = '<user-uuid>';
SELECT * FROM no_show_checks WHERE user_id = '<user-uuid>';

-- 노쇼 위험 유저 조회
SELECT id, phone, no_show_count, status
FROM profiles
WHERE no_show_count >= 2
ORDER BY no_show_count DESC;

-- 미처리 신고 목록
SELECT sr.id, sr.report_type, sr.description, sr.created_at,
       p1.phone AS reporter, p2.phone AS reported
FROM safety_reports sr
JOIN profiles p1 ON sr.reporter_id = p1.id
JOIN profiles p2 ON sr.reported_user_id = p2.id
WHERE sr.status = 'pending'
ORDER BY sr.created_at DESC;

-- 오늘 예정된 미션
SELECT m.id, m.place_name, m.meeting_time, m.status
FROM missions m
WHERE m.meeting_date = CURRENT_DATE
ORDER BY m.meeting_time;
```

---

## 주요 기능 상세

### 인증 흐름
```
/ (랜딩) → /login (전화번호) → /verify (OTP 6자리)
  → 프로필 없음 → /onboarding (5단계) → /onboarding/complete → /home
  → 프로필 있음 → /home
```

### 미들웨어 보호 로직
- 미인증 + 비공개 경로 접근 → `/login` 리다이렉트
- 인증 + 로그인/인증 페이지 접근 → 프로필 유무에 따라 `/home` 또는 `/onboarding`
- 인증 + 메인 앱 접근 + 프로필 없음 → `/onboarding`

### RLS (Row Level Security) 정책
- **profiles**: 본인만 읽기/수정
- **questions**: 인증 유저 + is_active=true만 읽기
- **user_answers**: 본인만 CRUD
- **matches**: 매칭 당사자만 읽기
- **missions**: 매칭 당사자만 읽기/수정
- **safety_reports**: 본인 신고만 읽기, 인증 유저 신고 가능
- **no_show_checks**: 본인 것만 읽기/수정

### 아직 미구현 (TODO)
- [ ] 질문 목록 UI 및 답변 제출
- [ ] AI 매칭 알고리즘 (similarity/compatibility 계산)
- [ ] AI 미션 생성 (장소/소품 자동 선택)
- [ ] 매칭 목록 UI
- [ ] 설정 페이지 (프로필 수정, 계정 정지, 탈퇴)
- [ ] 푸시 알림 (출발 확인 리마인더)
- [ ] Google Maps 장소 표시
- [ ] 관리자 대시보드 (신고 관리, 노쇼 관리)
