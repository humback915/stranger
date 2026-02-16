import { describe, it, expect } from "vitest";
import { IDENTIFICATION_ACTIONS } from "@/lib/constants/actions";

describe("IDENTIFICATION_ACTIONS", () => {
  it("should have at least 2 actions for unique assignment", () => {
    expect(IDENTIFICATION_ACTIONS.length).toBeGreaterThanOrEqual(2);
  });

  it("should have no duplicate actions", () => {
    const unique = new Set(IDENTIFICATION_ACTIONS);
    expect(unique.size).toBe(IDENTIFICATION_ACTIONS.length);
  });

  it("should only contain non-empty strings", () => {
    for (const action of IDENTIFICATION_ACTIONS) {
      expect(action.trim().length).toBeGreaterThan(0);
    }
  });
});
