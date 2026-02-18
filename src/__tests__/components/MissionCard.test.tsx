import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MissionCard from "@/components/mission/MissionCard";

// Mock DepartureConfirmation
vi.mock("@/components/mission/DepartureConfirmation", () => ({
  default: () => <div data-testid="departure-confirmation" />,
}));

// Mock MissionMap
vi.mock("@/components/mission/MissionMap", () => ({
  default: () => <div data-testid="mission-map" />,
}));

const baseMission = {
  id: 1,
  place_name: "스타벅스 강남점",
  place_address: "서울시 강남구",
  place_lat: 37.4979,
  place_lng: 127.0276,
  place_category: "cafe",
  user_a_prop_category: "clothing_color",
  user_a_prop_name: "빨간색 상의",
  user_a_prop_description: null,
  user_b_prop_category: "accessory",
  user_b_prop_name: "에코백",
  user_b_prop_description: null,
  user_a_action: "짝다리를 짚고 서 있기",
  user_b_action: "팔짱을 끼고 벽에 기대기",
  meeting_date: "2026-03-01",
  meeting_time: "14:00",
  user_a_departure_confirmed: false,
  user_b_departure_confirmed: false,
  status: "scheduled",
};

describe("MissionCard", () => {
  it("shows partner nickname when provided", () => {
    render(
      <MissionCard
        mission={baseMission}
        role="user_a"
        partnerNickname="하늘별"
      />
    );

    expect(screen.getByText("상대방")).toBeInTheDocument();
    expect(screen.getByText("하늘별")).toBeInTheDocument();
  });

  it("hides partner section when no nickname", () => {
    render(<MissionCard mission={baseMission} role="user_a" />);

    expect(screen.queryByText("상대방")).not.toBeInTheDocument();
  });

  it("shows user_a prop and action for user_a role", () => {
    render(
      <MissionCard
        mission={baseMission}
        role="user_a"
        partnerNickname="별빛"
      />
    );

    expect(screen.getByText("빨간색 상의")).toBeInTheDocument();
    expect(screen.getByText("나의 식별 행동")).toBeInTheDocument();
    expect(screen.getByText("짝다리를 짚고 서 있기")).toBeInTheDocument();
  });

  it("shows user_b prop and action for user_b role", () => {
    render(
      <MissionCard
        mission={baseMission}
        role="user_b"
        partnerNickname="별빛"
      />
    );

    expect(screen.getByText("에코백")).toBeInTheDocument();
    expect(screen.getByText("나의 식별 행동")).toBeInTheDocument();
    expect(screen.getByText("팔짱을 끼고 벽에 기대기")).toBeInTheDocument();
  });

  it("hides action section when action is null", () => {
    const missionNoActions = {
      ...baseMission,
      user_a_action: null,
      user_b_action: null,
    };

    render(<MissionCard mission={missionNoActions} role="user_a" />);

    expect(screen.queryByText("나의 식별 행동")).not.toBeInTheDocument();
  });

  it("shows place info", () => {
    render(<MissionCard mission={baseMission} role="user_a" />);

    expect(screen.getByText("스타벅스 강남점")).toBeInTheDocument();
    expect(screen.getByText("서울시 강남구")).toBeInTheDocument();
    expect(screen.getByText("카페")).toBeInTheDocument();
  });
});
