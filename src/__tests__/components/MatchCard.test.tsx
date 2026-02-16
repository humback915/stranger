import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MatchCard from "@/components/matches/MatchCard";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock server action
vi.mock("@/actions/matching", () => ({
  respondToMatch: vi.fn(),
}));

const basePartner = {
  id: "partner-1",
  nickname: "하늘별",
  gender: "female" as const,
  birth_year: 1995,
  occupation: "디자이너",
  mbti: "INFP",
  activity_area: "강남구",
};

const baseMatch = {
  id: 1,
  similarity_score: 0.85,
  compatibility_score: 0.9,
  distance_km: 3.5,
  user_a_accepted: null as boolean | null,
  user_b_accepted: null as boolean | null,
  status: "pending",
  created_at: "2026-01-01",
  role: "user_a" as const,
  partner: basePartner,
  missionId: null as number | null,
};

describe("MatchCard — progressive disclosure", () => {
  it("pending: shows age and area only, hides occupation/MBTI/nickname", () => {
    render(<MatchCard match={{ ...baseMatch, status: "pending" }} />);

    const currentYear = new Date().getFullYear();
    const expectedAge = currentYear - 1995;

    // Age and area visible
    expect(screen.getByText(`${expectedAge}세 · 강남구`)).toBeInTheDocument();
    // Hint text visible
    expect(screen.getByText("매칭 성사 후 상세 정보가 공개됩니다")).toBeInTheDocument();
    // Nickname hidden
    expect(screen.queryByText("하늘별")).not.toBeInTheDocument();
    // Occupation hidden
    expect(screen.queryByText(/디자이너/)).not.toBeInTheDocument();
    // MBTI hidden
    expect(screen.queryByText(/INFP/)).not.toBeInTheDocument();
  });

  it("accepted: shows nickname, occupation, MBTI, and area", () => {
    render(
      <MatchCard
        match={{
          ...baseMatch,
          status: "accepted",
          user_a_accepted: true,
          user_b_accepted: true,
          missionId: 42,
        }}
      />
    );

    const currentYear = new Date().getFullYear();
    const expectedAge = currentYear - 1995;

    // Nickname visible
    expect(screen.getByText("하늘별")).toBeInTheDocument();
    // Full info visible
    expect(screen.getByText(`${expectedAge}세 · 디자이너`)).toBeInTheDocument();
    expect(screen.getByText(/INFP/)).toBeInTheDocument();
    // Hint text hidden
    expect(screen.queryByText("매칭 성사 후 상세 정보가 공개됩니다")).not.toBeInTheDocument();
  });

  it("accepted: shows mission link", () => {
    render(
      <MatchCard
        match={{
          ...baseMatch,
          status: "accepted",
          user_a_accepted: true,
          user_b_accepted: true,
          missionId: 42,
        }}
      />
    );

    expect(screen.getByText("미션 확인하기")).toBeInTheDocument();
  });
});
