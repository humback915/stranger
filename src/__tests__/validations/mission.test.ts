import { describe, it, expect } from "vitest";
import { missionSchema, departureConfirmSchema } from "@/lib/validations/mission";

const validMission = {
  match_id: 1,
  place_name: "스타벅스",
  place_address: "서울시 강남구",
  place_lat: 37.5,
  place_lng: 127.0,
  place_category: "cafe" as const,
  user_a_prop_category: "clothing_color" as const,
  user_a_prop_name: "빨간색 상의",
  user_b_prop_category: "accessory" as const,
  user_b_prop_name: "에코백",
  meeting_date: "2026-03-01",
  meeting_time: "14:00",
};

describe("missionSchema", () => {
  it("should accept valid mission without actions", () => {
    const result = missionSchema.safeParse(validMission);
    expect(result.success).toBe(true);
  });

  it("should accept valid mission with actions", () => {
    const result = missionSchema.safeParse({
      ...validMission,
      user_a_action: "짝다리를 짚고 서 있기",
      user_b_action: "팔짱을 끼고 벽에 기대기",
    });
    expect(result.success).toBe(true);
  });

  it("should accept mission with only one action", () => {
    const result = missionSchema.safeParse({
      ...validMission,
      user_a_action: "턱을 괴고 창밖 바라보기",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid place_category", () => {
    const result = missionSchema.safeParse({
      ...validMission,
      place_category: "invalid_place",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid prop name", () => {
    const result = missionSchema.safeParse({
      ...validMission,
      user_a_prop_name: "없는 소품",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid meeting_date format", () => {
    const result = missionSchema.safeParse({
      ...validMission,
      meeting_date: "2026/03/01",
    });
    expect(result.success).toBe(false);
  });
});

describe("departureConfirmSchema", () => {
  it("should accept valid mission_id", () => {
    const result = departureConfirmSchema.safeParse({ mission_id: 1 });
    expect(result.success).toBe(true);
  });

  it("should reject non-positive mission_id", () => {
    const result = departureConfirmSchema.safeParse({ mission_id: 0 });
    expect(result.success).toBe(false);
  });
});
