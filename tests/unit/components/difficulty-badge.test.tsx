import { describe, it, expect } from "vitest";
import { render, screen } from "../../utils";
import { DifficultyBadge, CompetitionBadge } from "@/components/difficulty-badge";

describe("DifficultyBadge", () => {
  describe("difficulty categorization", () => {
    it("shows Easy for difficulty <= 30", () => {
      render(<DifficultyBadge difficulty={25} />);
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("Easy")).toBeInTheDocument();
    });

    it("shows Easy for difficulty exactly 30", () => {
      render(<DifficultyBadge difficulty={30} />);
      expect(screen.getByText("30")).toBeInTheDocument();
      expect(screen.getByText("Easy")).toBeInTheDocument();
    });

    it("shows Medium for difficulty 31-60", () => {
      render(<DifficultyBadge difficulty={45} />);
      expect(screen.getByText("45")).toBeInTheDocument();
      expect(screen.getByText("Medium")).toBeInTheDocument();
    });

    it("shows Medium for difficulty exactly 60", () => {
      render(<DifficultyBadge difficulty={60} />);
      expect(screen.getByText("60")).toBeInTheDocument();
      expect(screen.getByText("Medium")).toBeInTheDocument();
    });

    it("shows Hard for difficulty > 60", () => {
      render(<DifficultyBadge difficulty={75} />);
      expect(screen.getByText("75")).toBeInTheDocument();
      expect(screen.getByText("Hard")).toBeInTheDocument();
    });

    it("shows Hard for difficulty 100", () => {
      render(<DifficultyBadge difficulty={100} />);
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("Hard")).toBeInTheDocument();
    });
  });

  describe("bar variant", () => {
    it("renders progress bar", () => {
      const { container } = render(<DifficultyBadge difficulty={50} variant="bar" />);
      const bar = container.querySelector("[style*='width: 50%']");
      expect(bar).toBeInTheDocument();
    });

    it("bar width matches difficulty percentage", () => {
      const { container } = render(<DifficultyBadge difficulty={75} variant="bar" />);
      const bar = container.querySelector("[style*='width: 75%']");
      expect(bar).toBeInTheDocument();
    });

    it("shows difficulty number alongside bar", () => {
      render(<DifficultyBadge difficulty={40} variant="bar" />);
      expect(screen.getByText("40")).toBeInTheDocument();
    });
  });

  describe("dots variant", () => {
    it("renders 5 dots", () => {
      const { container } = render(<DifficultyBadge difficulty={50} variant="dots" />);
      const dots = container.querySelectorAll(".rounded-full.w-2.h-2");
      expect(dots.length).toBe(5);
    });

    it("fills correct number of dots for difficulty 20 (1 dot)", () => {
      const { container } = render(<DifficultyBadge difficulty={20} variant="dots" showLabel={false} />);
      const dots = container.querySelectorAll(".rounded-full.w-2.h-2");
      // difficulty 20 → 20/20 = 1 filled dot
      const filledCount = Array.from(dots).filter(dot =>
        dot.className.includes("bg-score-")
      ).length;
      expect(filledCount).toBe(1);
    });

    it("fills correct number of dots for difficulty 60 (3 dots)", () => {
      const { container } = render(<DifficultyBadge difficulty={60} variant="dots" showLabel={false} />);
      const dots = container.querySelectorAll(".rounded-full.w-2.h-2");
      // difficulty 60 → 60/20 = 3 filled dots
      const filledCount = Array.from(dots).filter(dot =>
        dot.className.includes("bg-score-")
      ).length;
      expect(filledCount).toBe(3);
    });

    it("fills all 5 dots for difficulty 100", () => {
      const { container } = render(<DifficultyBadge difficulty={100} variant="dots" showLabel={false} />);
      const dots = container.querySelectorAll(".rounded-full.w-2.h-2");
      // difficulty 100 → 100/20 = 5 filled dots
      const filledCount = Array.from(dots).filter(dot =>
        dot.className.includes("bg-score-")
      ).length;
      expect(filledCount).toBe(5);
    });

    it("shows label with dots variant", () => {
      render(<DifficultyBadge difficulty={25} variant="dots" showLabel />);
      expect(screen.getByText("Easy")).toBeInTheDocument();
    });
  });

  describe("size prop", () => {
    it("applies sm size classes", () => {
      const { container } = render(<DifficultyBadge difficulty={50} size="sm" />);
      expect(container.firstChild).toHaveClass("text-xs");
    });

    it("applies md size classes by default", () => {
      const { container } = render(<DifficultyBadge difficulty={50} />);
      expect(container.firstChild).toHaveClass("text-sm");
    });

    it("applies lg size classes", () => {
      const { container } = render(<DifficultyBadge difficulty={50} size="lg" />);
      expect(container.firstChild).toHaveClass("text-base");
    });
  });

  describe("showLabel prop", () => {
    it("shows label by default", () => {
      render(<DifficultyBadge difficulty={50} />);
      expect(screen.getByText("Medium")).toBeInTheDocument();
    });

    it("hides label when showLabel is false", () => {
      render(<DifficultyBadge difficulty={50} showLabel={false} />);
      expect(screen.queryByText("Medium")).not.toBeInTheDocument();
    });
  });

  describe("title attribute", () => {
    it("has correct title for badge variant", () => {
      const { container } = render(<DifficultyBadge difficulty={45} />);
      expect(container.firstChild).toHaveAttribute("title", "Difficulty: 45/100");
    });

    it("has correct title for dots variant", () => {
      const { container } = render(<DifficultyBadge difficulty={30} variant="dots" />);
      expect(container.firstChild).toHaveAttribute("title", "Difficulty: 30/100 (Easy)");
    });
  });
});

describe("CompetitionBadge", () => {
  it("shows Low for low competition", () => {
    render(<CompetitionBadge competition="low" />);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("shows Medium for medium competition", () => {
    render(<CompetitionBadge competition="medium" />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("shows High for high competition", () => {
    render(<CompetitionBadge competition="high" />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  describe("size prop", () => {
    it("applies sm size classes", () => {
      const { container } = render(<CompetitionBadge competition="medium" size="sm" />);
      expect(container.firstChild).toHaveClass("text-xs");
    });

    it("applies md size by default", () => {
      const { container } = render(<CompetitionBadge competition="medium" />);
      expect(container.firstChild).toHaveClass("text-sm");
    });

    it("applies lg size classes", () => {
      const { container } = render(<CompetitionBadge competition="medium" size="lg" />);
      expect(container.firstChild).toHaveClass("text-base");
    });
  });
});
