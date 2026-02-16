import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AgeGenderStep from "@/components/onboarding/AgeGenderStep";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("@/components/motion/PageTransition", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock sessionStorage
const sessionStore: Record<string, string> = {};
beforeEach(() => {
  mockPush.mockClear();
  Object.keys(sessionStore).forEach((k) => delete sessionStore[k]);

  vi.stubGlobal("sessionStorage", {
    getItem: vi.fn((key: string) => sessionStore[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      sessionStore[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete sessionStore[key];
    }),
  });
});

describe("AgeGenderStep", () => {
  it("renders nickname input field", () => {
    render(<AgeGenderStep />);
    expect(screen.getByText("닉네임")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("2~10자 닉네임")).toBeInTheDocument();
  });

  it("disables button when nickname is empty", () => {
    render(<AgeGenderStep />);
    const button = screen.getByRole("button", { name: "다음" });
    expect(button).toBeDisabled();
  });

  it("shows error for nickname shorter than 2 chars", () => {
    render(<AgeGenderStep />);

    fireEvent.change(screen.getByPlaceholderText("2~10자 닉네임"), {
      target: { value: "A" },
    });
    fireEvent.change(screen.getByPlaceholderText("예: 1995"), {
      target: { value: "1995" },
    });
    fireEvent.click(screen.getByText("남성"));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByText("닉네임은 2~10자로 입력해주세요")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("saves nickname to sessionStorage on valid submit", () => {
    render(<AgeGenderStep />);

    fireEvent.change(screen.getByPlaceholderText("2~10자 닉네임"), {
      target: { value: "하늘별" },
    });
    fireEvent.change(screen.getByPlaceholderText("예: 1995"), {
      target: { value: "1995" },
    });
    fireEvent.click(screen.getByText("남성"));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    const saved = JSON.parse(sessionStore["onboarding"]);
    expect(saved.nickname).toBe("하늘별");
    expect(saved.birth_year).toBe(1995);
    expect(saved.gender).toBe("male");
    expect(mockPush).toHaveBeenCalled();
  });
});
